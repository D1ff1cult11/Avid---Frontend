import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler";
import { ElectionService } from "../services/electionService";
import { MembershipService } from "../services/membershipService";
import { ensureNullableString, ensureObject, ensureString, validateDateString } from "../utils/validation";

export class ElectionController {
  constructor(
    private readonly electionService: ElectionService,
    private readonly membershipService: MembershipService
  ) {}

  createElection = asyncHandler(async (req: Request, res: Response) => {
    const body = ensureObject(req.body, "body");

    const electionId = ensureString(body.electionId, "electionId");
    const startTime = ensureString(body.startTime, "startTime");
    const endTime = ensureNullableString(body.endTime, "endTime");
    validateDateString(startTime, "startTime");
    if (endTime !== null) {
      validateDateString(endTime, "endTime");
    }

    const election = await this.electionService.createElection({
      electionId,
      startTime,
      endTime
    });

    res.status(201).json({ data: election });
  });

  listElections = asyncHandler(async (_req: Request, res: Response) => {
    const elections = await this.electionService.listElections();
    res.status(200).json({ data: elections });
  });

  getElectionById = asyncHandler(async (req: Request, res: Response) => {
    const electionId = ensureString(req.params.id, "id");
    const election = await this.electionService.getElectionOrThrow(electionId);
    res.status(200).json({ data: election });
  });

  getElectionServers = asyncHandler(async (req: Request, res: Response) => {
    const electionId = ensureString(req.params.id, "id");
    const servers = await this.membershipService.listServersForElection(electionId);
    res.status(200).json({ data: servers });
  });
}
