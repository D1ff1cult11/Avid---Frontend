import type { ElectionConfig } from "../types/election";

export const electionConfig: ElectionConfig = {
  electionId: "2026",
  electionName: "National General Election",
  position: "President",
  candidates: [
    { id: "c1", name: "Candidate A" },
    { id: "c2", name: "Candidate B" },
    { id: "c3", name: "Candidate C" }
  ]
};
