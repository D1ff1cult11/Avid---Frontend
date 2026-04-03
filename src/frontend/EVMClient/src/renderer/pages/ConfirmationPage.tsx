import React from 'react';
import { useVotingSession } from '../hooks/useVotingSession';
import { StatusBanner } from '../components/StatusBanner';

const ConfirmationPage: React.FC = () => {
  const { sessionStatus, errorMessage, resetSession } = useVotingSession();

  return (
    <div style={{ textAlign: 'center', marginTop: '40px' }}>
      {sessionStatus === 'VOTED' ? (
        <>
          <h2 style={{ color: '#166534' }}>Vote Submitted Successfully</h2>
          <p>Your vote has been recorded by the distributed quorum and your tracking mask has been submitted.</p>
        </>
      ) : (
        <>
          <h2 style={{ color: '#991b1b' }}>Failed to Submit Vote</h2>
          {errorMessage && <StatusBanner type="error" message={errorMessage} />}
        </>
      )}

      <button 
        onClick={resetSession}
        style={{ marginTop: '30px', padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}
      >
        Return to Home
      </button>
    </div>
  );
};

export default ConfirmationPage;
