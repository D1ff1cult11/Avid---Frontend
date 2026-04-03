import { LocalState } from './localState';

interface SessionData {
  sessionId: string;
  voterId: string;
  status: 'INIT' | 'ELIGIBLE' | 'VOTED';
}

interface VoteSessionSchema {
  currentSession: SessionData | null;
}

export const voteSessionStore = new LocalState<VoteSessionSchema>('vote-session', { currentSession: null });

export function startSession(sessionId: string, voterId: string) {
  voteSessionStore.set('currentSession', { sessionId, voterId, status: 'INIT' });
}

export function updateSessionStatus(status: 'INIT' | 'ELIGIBLE' | 'VOTED') {
  const session = voteSessionStore.get('currentSession');
  if (session) {
    session.status = status;
    voteSessionStore.set('currentSession', session);
  }
}

export function getCurrentSession() {
  return voteSessionStore.get('currentSession');
}
