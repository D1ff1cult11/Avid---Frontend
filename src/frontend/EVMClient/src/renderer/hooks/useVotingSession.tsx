import React, { createContext, useContext, useState, ReactNode } from 'react';

type SessionStatus = 'INIT' | 'ELIGIBLE' | 'CHECKING' | 'VOTING' | 'VOTED' | 'ERROR';

interface VotingSessionContextType {
  sessionStatus: SessionStatus;
  voterId: string;
  electionId: string;
  errorMessage: string | null;
  checkEligibility: (id: string, electionId: string) => Promise<void>;
  submitVote: (candidateId: string) => Promise<void>;
  resetSession: () => void;
}

const INIT: SessionStatus = 'INIT';
const VotingSessionContext = createContext<VotingSessionContextType | undefined>({
  sessionStatus: INIT,
  voterId: '',
  electionId: '',
  errorMessage: null,
  checkEligibility: async () => { },
  submitVote: async () => { },
  resetSession: () => { }
});

// Extend window for typed IPC
declare global {
  interface Window {
    electronAPI: {
      checkEligibility: (voterId: string, electionId: string) => Promise<any>;
      submitVote: (voterId: string, electionId: string, candidateId: string) => Promise<any>;
      getMembers: () => Promise<any>;
      getConfig: () => Promise<any>;
    };
  }
}

export const VotingSessionProvider: React.FC<{ children: ReactNode; electionId: string; userId: string }> = ({ children, electionId, userId }) => {
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>(INIT);
  const [voterId, setVoterId] = useState<string>(userId);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const checkEligibility = async (id: string, elId: string) => {
    setSessionStatus('CHECKING');
    setErrorMessage(null);
    try {
      const { success, result, error } = await window.electronAPI.checkEligibility(id, elId);
      if (success && result) {
        setVoterId(id);
        setSessionStatus('ELIGIBLE');
      } else {
        setErrorMessage(error || 'Not eligible or quorum failed');
        setSessionStatus(INIT);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error occurred');
      setSessionStatus('INIT');
    }
  };

  const submitVote = async (candidateId: string) => {
    setSessionStatus('VOTING');
    setErrorMessage(null);
    try {
      const { success, result, error } = await window.electronAPI.submitVote(voterId, electionId, candidateId);
      if (success && result) {
        setSessionStatus('VOTED');
      } else {
        setErrorMessage(error || 'Failed to submit vote');
        setSessionStatus('ERROR');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error occurred');
      setSessionStatus('ERROR');
    }
  };

  const resetSession = () => {
    setSessionStatus(INIT);
    setVoterId(userId);
    setErrorMessage(null);
  };

  return (
    <VotingSessionContext.Provider value={{ sessionStatus, voterId, electionId, errorMessage, checkEligibility, submitVote, resetSession }}>
      {children}
    </VotingSessionContext.Provider>
  );
};

export const useVotingSession = () => {
  const context = useContext(VotingSessionContext);
  if (!context) {
    throw new Error('useVotingSession must be used within a VotingSessionProvider');
  }
  return context;
};
