import { LocalState } from './localState';

interface MaskData {
  maskKey: string;
  submitted: boolean;
}

interface MaskStoreSchema {
  masks: Record<string, MaskData>;
}

export const maskStore = new LocalState<MaskStoreSchema>('mask-store', { masks: {} });

export function saveMaskData(voteSessionId: string, maskKey: string) {
  const masks = maskStore.get('masks');
  masks[voteSessionId] = { maskKey, submitted: false };
  maskStore.set('masks', masks);
}

export function markMaskSubmitted(voteSessionId: string) {
  const masks = maskStore.get('masks');
  if (masks[voteSessionId]) {
    masks[voteSessionId].submitted = true;
    maskStore.set('masks', masks);
  }
}
