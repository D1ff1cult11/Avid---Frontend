import { buildJoinSigningPayload, buildLeaveSigningPayload, buildRevokeSigningPayload } from "../crypto/signingPayload";
import { verifySignature } from "../crypto/verifySignature";
import { SQLiteClient } from "../db/sqlite";
import { ConflictError, ForbiddenError, NotFoundError, UnauthorizedError } from "../errors/AppError";
import { LedgerEventType } from "../models/ledgerEvent";
import { VoteServer, VoteServerStatus } from "../models/voteServer";
import { ElectionRepository } from "../repositories/electionRepo";
import { ServerRepository } from "../repositories/serverRepo";
import { JoinRequest, LeaveRequest, RevokeRequest } from "../types/api";
import { LedgerService } from "./ledgerService";

export class MembershipService {
  constructor(
    private readonly db: SQLiteClient,
    private readonly electionRepo: ElectionRepository,
    private readonly serverRepo: ServerRepository,
    private readonly ledgerService: LedgerService,
    private readonly ecPublicKeyPem: string
  ) {}

  async join(request: JoinRequest): Promise<VoteServer> {
    const election = await this.electionRepo.findById(request.electionId);
    if (!election) {
      throw new NotFoundError("Election not found", { electionId: request.electionId });
    }

    const certificateValid = verifySignature({
      publicKeyPem: this.ecPublicKeyPem,
      payload: request.certificate.vsPublicKey,
      signatureBase64: request.certificate.signatureByEC
    });

    if (!certificateValid) {
      throw new UnauthorizedError("Invalid Vote Server certificate signature");
    }

    // The server signs a canonical JOIN payload to prove key possession.
    const joinPayload = buildJoinSigningPayload({
      electionId: request.electionId,
      serverId: request.serverId,
      vsPublicKey: request.certificate.vsPublicKey,
      timestamp: request.timestamp
    });

    const joinSignatureValid = verifySignature({
      publicKeyPem: request.certificate.vsPublicKey,
      payload: joinPayload,
      signatureBase64: request.signatureByVS
    });

    if (!joinSignatureValid) {
      throw new UnauthorizedError("Invalid Vote Server join signature");
    }

    const current = await this.serverRepo.findByServerAndElection(request.serverId, request.electionId);
    if (current?.status === VoteServerStatus.ACTIVE) {
      throw new ConflictError("Server is already ACTIVE for this election");
    }

    if (current?.status === VoteServerStatus.REVOKED) {
      throw new ForbiddenError("Revoked server cannot re-join this election");
    }

    return this.db.transaction(async () => {
      await this.ledgerService.append({
        electionId: request.electionId,
        eventType: LedgerEventType.JOIN,
        serverId: request.serverId,
        vsPublicKey: request.certificate.vsPublicKey,
        timestamp: request.timestamp,
        payload: {
          certificate: request.certificate,
          timestamp: request.timestamp,
          signatureByVS: request.signatureByVS
        }
      });

      await this.serverRepo.upsertOnJoin({
        serverId: request.serverId,
        electionId: request.electionId,
        vsPublicKey: request.certificate.vsPublicKey,
        joinedAt: request.timestamp
      });

      const updated = await this.serverRepo.findByServerAndElection(request.serverId, request.electionId);
      if (!updated) {
        throw new Error("Failed to materialize JOIN state");
      }

      return updated;
    });
  }

  async leave(request: LeaveRequest): Promise<VoteServer> {
    const election = await this.electionRepo.findById(request.electionId);
    if (!election) {
      throw new NotFoundError("Election not found", { electionId: request.electionId });
    }

    const current = await this.serverRepo.findByServerAndElection(request.serverId, request.electionId);
    if (!current) {
      throw new NotFoundError("Server membership not found for election", {
        serverId: request.serverId,
        electionId: request.electionId
      });
    }

    if (current.status !== VoteServerStatus.ACTIVE) {
      throw new ConflictError("Only ACTIVE servers can leave", {
        status: current.status
      });
    }

    const leavePayload = buildLeaveSigningPayload({
      electionId: request.electionId,
      serverId: request.serverId,
      timestamp: request.timestamp
    });

    const signatureValid = verifySignature({
      publicKeyPem: current.vsPublicKey,
      payload: leavePayload,
      signatureBase64: request.signatureByVS
    });

    if (!signatureValid) {
      throw new UnauthorizedError("Invalid Vote Server leave signature");
    }

    return this.db.transaction(async () => {
      await this.ledgerService.append({
        electionId: request.electionId,
        eventType: LedgerEventType.LEAVE,
        serverId: request.serverId,
        vsPublicKey: current.vsPublicKey,
        timestamp: request.timestamp,
        payload: {
          timestamp: request.timestamp,
          signatureByVS: request.signatureByVS
        }
      });

      await this.serverRepo.markLeft(request.serverId, request.electionId, request.timestamp);

      const updated = await this.serverRepo.findByServerAndElection(request.serverId, request.electionId);
      if (!updated) {
        throw new Error("Failed to materialize LEAVE state");
      }

      return updated;
    });
  }

  async revoke(request: RevokeRequest): Promise<VoteServer> {
    const election = await this.electionRepo.findById(request.electionId);
    if (!election) {
      throw new NotFoundError("Election not found", { electionId: request.electionId });
    }

    const current = await this.serverRepo.findByServerAndElection(request.serverId, request.electionId);
    if (!current) {
      throw new NotFoundError("Server membership not found for election", {
        serverId: request.serverId,
        electionId: request.electionId
      });
    }

    if (current.status === VoteServerStatus.REVOKED) {
      throw new ConflictError("Server is already REVOKED", {
        serverId: request.serverId,
        electionId: request.electionId
      });
    }

    // EC signs revoke payload to authorize forced removal.
    const revokePayload = buildRevokeSigningPayload({
      electionId: request.electionId,
      serverId: request.serverId,
      timestamp: request.timestamp,
      reason: request.reason
    });

    const signatureValid = verifySignature({
      publicKeyPem: this.ecPublicKeyPem,
      payload: revokePayload,
      signatureBase64: request.signatureByEC
    });

    if (!signatureValid) {
      throw new UnauthorizedError("Invalid Election Commissioner signature");
    }

    return this.db.transaction(async () => {
      await this.ledgerService.append({
        electionId: request.electionId,
        eventType: LedgerEventType.REVOKE,
        serverId: request.serverId,
        vsPublicKey: current.vsPublicKey,
        timestamp: request.timestamp,
        payload: {
          timestamp: request.timestamp,
          reason: request.reason ?? null,
          signatureByEC: request.signatureByEC
        }
      });

      await this.serverRepo.markRevoked(request.serverId, request.electionId, request.timestamp);

      const updated = await this.serverRepo.findByServerAndElection(request.serverId, request.electionId);
      if (!updated) {
        throw new Error("Failed to materialize REVOKE state");
      }

      return updated;
    });
  }

  async listServersForElection(electionId: string): Promise<VoteServer[]> {
    const election = await this.electionRepo.findById(electionId);
    if (!election) {
      throw new NotFoundError("Election not found", { electionId });
    }

    return this.serverRepo.listByElection(electionId);
  }

  async listElectionsForServer(serverId: string): Promise<VoteServer[]> {
    return this.serverRepo.listByServer(serverId);
  }
}
