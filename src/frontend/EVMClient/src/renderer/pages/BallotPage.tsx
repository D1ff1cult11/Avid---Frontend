import React, { useState } from 'react';
import { useVotingSession } from '../hooks/useVotingSession';
import CandidateList from '../components/CandidateList';

const fakeCandidates = [
  { id: 'c-1', name: 'Alice Smith', party: 'Progressive' },
  { id: 'c-2', name: 'Bob Johnson', party: 'Conservative' },
  { id: 'c-3', name: 'Charlie Davis', party: 'Independent' },
];

const BallotPage: React.FC = () => {
  const { submitVote, sessionStatus, voterId } = useVotingSession();
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);

  const handleVote = () => {
    if (selectedCandidate) {
      submitVote(selectedCandidate);
    }
  };

  return (
    <div>
      <h3>Official Ballot</h3>
      <p>Authenticated as: <strong>{voterId}</strong></p>
      
      <CandidateList 
        candidates={fakeCandidates}
        selectedId={selectedCandidate}
        onSelect={setSelectedCandidate}
        disabled={sessionStatus === 'VOTING'}
      />

      <div style={{ marginTop: '20px', textAlign: 'right' }}>
        <button 
          onClick={handleVote}
          disabled={!selectedCandidate || sessionStatus === 'VOTING'}
          style={{ 
            padding: '12px 24px', 
            fontSize: '18px', 
            backgroundColor: selectedCandidate ? '#0284c7' : '#e5e7eb',
            color: selectedCandidate ? 'white' : '#9ca3af',
            border: 'none',
            borderRadius: '4px',
            cursor: selectedCandidate ? 'pointer' : 'not-allowed'
          }}
        >
          {sessionStatus === 'VOTING' ? 'Submitting...' : 'Submit Vote'}
        </button>
      </div>
    </div>
  );
};

export default BallotPage;
