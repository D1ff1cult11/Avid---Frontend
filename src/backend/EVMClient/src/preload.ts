import { contextBridge, ipcRenderer } from 'electron';

export const electronAPI = {
  // Protocol flows
  checkEligibility: (voterId: string) => ipcRenderer.invoke('protocol:checkEligibility', voterId),
  submitVote: (voterId: string, candidateId: string) => ipcRenderer.invoke('protocol:submitVote', voterId, candidateId),
  
  // Basic queries
  getMembers: () => ipcRenderer.invoke('protocol:getMembers'),
  getConfig: () => ipcRenderer.invoke('protocol:getConfig'),
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);
