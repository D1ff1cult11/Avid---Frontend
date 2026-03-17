import { Request, Response } from "express";
import { MembershipService } from "../services/membershipService";
import { asyncHandler } from "../middlewares/asyncHandler";
import {
  ensureObject,
  ensureOptionalString,
  ensureString,
  validateDateString
} from "../utils/validation";

export class MembershipController {
  constructor(private readonly membershipService: MembershipService) {}

  join = asyncHandler(async (req: Request, res: Response) => {
    const body = ensureObject(req.body, "body");
    const certificate = ensureObject(body.certificate, "certificate");

    const electionId = ensureString(body.electionId, "electionId");
    const serverId = ensureString(body.serverId, "serverId");
    const vsPublicKey = ensureString(certificate.vsPublicKey, "certificate.vsPublicKey");
    const signatureByEC = ensureString(certificate.signatureByEC, "certificate.signatureByEC");
    const timestamp = ensureString(body.timestamp, "timestamp");
    const signatureByVS = ensureString(body.signatureByVS, "signatureByVS");
    validateDateString(timestamp, "timestamp");

    const updatedServer = await this.membershipService.join({
      electionId,
      serverId,
      certificate: {
        vsPublicKey,
        signatureByEC
      },
      timestamp,
      signatureByVS
    });

    res.status(200).json({ data: updatedServer });
  });

  leave = asyncHandler(async (req: Request, res: Response) => {
    const body = ensureObject(req.body, "body");

    const electionId = ensureString(body.electionId, "electionId");
    const serverId = ensureString(body.serverId, "serverId");
    const timestamp = ensureString(body.timestamp, "timestamp");
    const signatureByVS = ensureString(body.signatureByVS, "signatureByVS");
    validateDateString(timestamp, "timestamp");

    const updatedServer = await this.membershipService.leave({
      electionId,
      serverId,
      timestamp,
      signatureByVS
    });

    res.status(200).json({ data: updatedServer });
  });

  revoke = asyncHandler(async (req: Request, res: Response) => {
    const body = ensureObject(req.body, "body");

    const electionId = ensureString(body.electionId, "electionId");
    const serverId = ensureString(body.serverId, "serverId");
    const timestamp = ensureString(body.timestamp, "timestamp");
    const reason = ensureOptionalString(body.reason, "reason");
    const signatureByEC = ensureString(body.signatureByEC, "signatureByEC");
    validateDateString(timestamp, "timestamp");

    const updatedServer = await this.membershipService.revoke({
      electionId,
      serverId,
      timestamp,
      reason,
      signatureByEC
    });

    res.status(200).json({ data: updatedServer });
  });

  getByServerId = asyncHandler(async (req: Request, res: Response) => {
    const serverId = ensureString(req.params.serverId, "serverId");
    const records = await this.membershipService.listElectionsForServer(serverId);
    res.status(200).json({ data: records });
  });
}
