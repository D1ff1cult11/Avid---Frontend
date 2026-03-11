export interface VSCertificate {
  vsPublicKey: string;
  signatureByEC: string;
}

export interface CreateElectionRequest {
  electionId: string;
  startTime: string;
  endTime: string | null;
}

export interface JoinRequest {
  electionId: string;
  serverId: string;
  certificate: VSCertificate;
  timestamp: string;
  signatureByVS: string;
}

export interface LeaveRequest {
  electionId: string;
  serverId: string;
  timestamp: string;
  signatureByVS: string;
}

export interface RevokeRequest {
  electionId: string;
  serverId: string;
  timestamp: string;
  reason?: string;
  signatureByEC: string;
}
