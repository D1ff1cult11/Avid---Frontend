import React, { useState } from 'react';
import VoterAuthPage from '../pages/VoterAuthPage';
import BallotPage from '../pages/BallotPage';
import ConfirmationPage from '../pages/ConfirmationPage';
import { VotingSessionProvider, useVotingSession } from '../hooks/useVotingSession';

const AppContent: React.FC = () => {
  const { sessionStatus } = useVotingSession();
  console.log('Current Session Status:', sessionStatus);

  if (sessionStatus === 'INIT') {
    return <VoterAuthPage />;
  }
  
  if (sessionStatus === 'ELIGIBLE') {
    return <BallotPage />;
  }

  if (sessionStatus === 'VOTED' || sessionStatus === 'ERROR') {
    return <ConfirmationPage />;
  }

  return <div>Unknown State</div>;
};

const App: React.FC = () => {
  // These would typically come from an auth context or configuration
  const electionId = "election-1";
  const userId = "user-123";

  return (
    <VotingSessionProvider electionId={electionId} userId={userId}>
      <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 800, margin: '0 auto', padding: 20 }}>
        <h2>AVID EVM Decentralized Client</h2>
        <hr/>
        <AppContent />
      </div>
    </VotingSessionProvider>
  );
};

export default App;
