import React from 'react';

export const StatusBanner: React.FC<{ message: string; type: 'error' | 'info' | 'success' }> = ({ message, type }) => {
  const colors = {
    error: '#fee2e2',
    info: '#e0f2fe',
    success: '#dcfce7'
  };

  const textColors = {
    error: '#991b1b',
    info: '#075985',
    success: '#166534'
  };

  return (
    <div style={{
      backgroundColor: colors[type],
      color: textColors[type],
      padding: '12px',
      borderRadius: '6px',
      marginBottom: '16px',
      border: `1px solid ${textColors[type]}30`
    }}>
      {message}
    </div>
  );
};
