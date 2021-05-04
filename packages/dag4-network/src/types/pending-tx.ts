export type PendingTx = {
  hash: string;
  sender: string;
  receiver: string;
  amount: number;
  ordinal: number;
  status: 'POSTED' | 'MEM_POOL' | 'DROPPED' | 'CHECKPOINT_ACCEPTED' | 'GLOBAL_STATE_PENDING' | 'CONFIRMED' | 'UNKNOWN';
  pending?: boolean;
  pendingMsg?: string;
  timestamp: number;
  fee: number;
}
