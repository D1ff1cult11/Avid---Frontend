import { Election } from "../models/election";
import { ElectionRepository } from "../repositories/electionRepo";
import { ConflictError, NotFoundError, ValidationError } from "../errors/AppError";
import { CreateElectionRequest } from "../types/api";
import { isSqliteUniqueConstraintError, validateDateString } from "../utils/validation";

export class ElectionService {
  constructor(private readonly electionRepo: ElectionRepository) {}

  async createElection(request: CreateElectionRequest): Promise<Election> {
    validateDateString(request.startTime, "startTime");
    if (request.endTime !== null) {
      validateDateString(request.endTime, "endTime");

      const start = new Date(request.startTime).getTime();
      const end = new Date(request.endTime).getTime();
      if (end < start) {
        throw new ValidationError("endTime must be greater than or equal to startTime");
      }
    }

    const createdAt = new Date().toISOString();
    try {
      return await this.electionRepo.create({
        electionId: request.electionId,
        startTime: request.startTime,
        endTime: request.endTime,
        createdAt
      });
    } catch (error) {
      if (isSqliteUniqueConstraintError(error)) {
        throw new ConflictError("Election already exists", { electionId: request.electionId });
      }

      throw error;
    }
  }

  async listElections(): Promise<Election[]> {
    return this.electionRepo.listAll();
  }

  async getElectionOrThrow(electionId: string): Promise<Election> {
    const election = await this.electionRepo.findById(electionId);
    if (!election) {
      throw new NotFoundError("Election not found", { electionId });
    }

    return election;
  }
}
