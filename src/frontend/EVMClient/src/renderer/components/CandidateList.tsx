import React from 'react';

interface Candidate {
  id: string;
  name: string;
  party: string;
}

interface Props {
  candidates: Candidate[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  disabled?: boolean;
}

const CandidateList: React.FC<Props> = ({ candidates, selectedId, onSelect, disabled }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {candidates.map(c => (
        <div 
          key={c.id}
          onClick={() => !disabled && onSelect(c.id)}
          style={{
            padding: '16px',
            border: `2px solid ${selectedId === c.id ? '#0284c7' : '#e5e7eb'}`,
            borderRadius: '8px',
            cursor: disabled ? 'not-allowed' : 'pointer',
            backgroundColor: selectedId === c.id ? '#f0f9ff' : 'white',
            opacity: disabled ? 0.6 : 1,
            transition: 'all 0.2s'
          }}
        >
          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{c.name}</div>
          <div style={{ color: '#6b7280' }}>{c.party}</div>
        </div>
      ))}
    </div>
  );
};

export default CandidateList;
