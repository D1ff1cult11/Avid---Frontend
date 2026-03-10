import { Request, Response } from "express";
import { signResponse } from "../crypto/signResponse";
import { checkEligibility } from "../services/voterService";
import { submitVote } from "../services/voteService";
import { storeMask } from "../services/maskService";
import { EvmRequest, VsResponse } from "../types/evmRequest";
import { Payload } from "../types/payloadTypes";

function buildSignedResponse(requestNonce: number, responsePayload: unknown): VsResponse {
  const publicKeyVs = process.env.VS_PUBLIC_KEY || "";
  const serverId = process.env.SERVER_ID || "vs-unknown";

  const metadata = {
    timestamp: new Date().toISOString(),
    server_id: serverId,
    request_nonce: requestNonce
  };

  const responseWithoutSignature = {
    publicKeyVs,
    metadata,
    responsePayload
  };

  const signature = signResponse(responseWithoutSignature);

  return {
    ...responseWithoutSignature,
    signature
  };
}

function hasPayloadType(payload: unknown): payload is Payload {
  return Boolean(payload && typeof payload === "object" && "type" in payload);
}

export async function handleRequest(req: Request, res: Response): Promise<void> {
  const envelope = req.body as EvmRequest;
  console.log("Incoming request received", {
    type: envelope?.requestPayload && "type" in envelope.requestPayload ? envelope.requestPayload.type : "unknown"
  });

  if (!envelope || !envelope.requestPayload || !hasPayloadType(envelope.requestPayload)) {
    res.status(400).json({ error: true, message: "Invalid request payload envelope" });
    return;
  }

  try {
    const payload = envelope.requestPayload;

    switch (payload.type) {
      case "ELIGIBILITY_CHECK": {
        if (!payload.voterId) {
          res.status(400).json({ error: true, message: "voterId is required" });
          return;
        }

        const eligibility = await checkEligibility(payload.voterId);
        const signedResponse = buildSignedResponse(envelope.nonce, eligibility);
        res.status(200).json(signedResponse);
        return;
      }

      case "VOTE": {
        if (!payload.voterId || !payload.vote_data) {
          res.status(400).json({ error: true, message: "voterId and vote_data are required" });
          return;
        }

        await submitVote(payload.voterId, payload.vote_data);
        const signedResponse = buildSignedResponse(envelope.nonce, {
          success: true,
          message: "Vote stored successfully"
        });
        res.status(200).json(signedResponse);
        return;
      }

      case "MASK": {
        if (!payload.mask_data) {
          res.status(400).json({ error: true, message: "mask_data is required" });
          return;
        }

        await storeMask(payload.mask_data);
        const signedResponse = buildSignedResponse(envelope.nonce, {
          success: true,
          message: "Mask stored successfully"
        });
        res.status(200).json(signedResponse);
        return;
      }

      default:
        res.status(400).json({ error: true, message: "Unsupported payload type" });
        return;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.log("Request processing failed", { message });
    res.status(400).json({
      error: true,
      message
    });
  }
}