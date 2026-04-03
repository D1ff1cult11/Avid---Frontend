import React, { useState } from 'react';
import { useVotingSession } from '../hooks/useVotingSession';
import { StatusBanner } from '../components/StatusBanner';

const VoterAuthPage: React.FC = () => {
  const { checkEligibility, errorMessage, sessionStatus, electionId } = useVotingSession();
  const [inputValue, setInputValue] = useState('');

  const handleCheck = () => {
    if (inputValue.trim()) {
      checkEligibility(inputValue.trim(), electionId);
    }
  };

  return (
    <div>
      <h3>Voter Authentication</h3>
      <p>Enter your assigned Voter ID to verify eligibility and connect to the EVM quorum.</p>
      
      {errorMessage && <StatusBanner type="error" message={errorMessage} />}
      
      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        <input 
          type="text" 
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          placeholder="e.g., voter-1"
          style={{ padding: '8px', fontSize: '16px', flex: 1 }}
          disabled={sessionStatus === 'CHECKING'}
        />
        <button 
          onClick={handleCheck}
          disabled={sessionStatus === 'CHECKING' || !inputValue.trim()}
          style={{ padding: '8px 16px', fontSize: '16px', cursor: 'pointer' }}
        >
          {sessionStatus === 'CHECKING' ? 'Checking...' : 'Check Eligibility'}
        </button>
      </div>
    </div>
  );
};

export default VoterAuthPage;
