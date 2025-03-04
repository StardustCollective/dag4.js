import { Proof, TransactionReference } from "./transaction";

export type TokenLockBody = {
  source: string;
  amount: number;
  fee: number;
  currencyId: string;
  parent: TransactionReference;
  unlockEpoch: number;
};

export type SignedTokenLock = {
  value: TokenLockBody;
  proofs: Proof[];
};

export type AllowSpendBody = {
  source: string;
  destination: string;
  approvers: string[];
  amount: number;
  fee: number;
  currencyId?: string;
  parent: TransactionReference;
  lastValidEpochProgress: number;
};

export type SignedAllowSpend = {
  value: AllowSpendBody;
  proofs: Proof[];
};
