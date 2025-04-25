import { Proof, TransactionReference } from "./transaction";

/**
 * Base type for all operations that include a currency ID
 */
export type WithCurrencyId<T> = T & {
  currencyId: string | null;
};

/**
 * Base type for all operations that include a parent transaction reference
 */
export type WithParent<T> = T & {
  parent: TransactionReference;
};

/**
 * Base type for all signed operations
 */
export type SignedOperation<T> = {
  value: T;
  proofs: Proof[];
};

// Token Lock
export type TokenLock = {
  source: string;
  amount: number;
  fee?: number;
  unlockEpoch: number | null;
};

export type TokenLockWithCurrencyId = WithCurrencyId<TokenLock>;
export type TokenLockWithParent = WithParent<TokenLockWithCurrencyId>;
export type SignedTokenLock = SignedOperation<TokenLockWithParent>;

// Allow Spend
export type AllowSpend = {
  source: string;
  destination: string;
  approvers: string[];
  amount: number;
  fee?: number;
  validUntilEpoch: number;
};

export type AllowSpendWithCurrencyId = WithCurrencyId<AllowSpend>;
export type AllowSpendWithParent = WithParent<AllowSpendWithCurrencyId>;
export type SignedAllowSpend = SignedOperation<AllowSpendWithParent>;

// Delegated Stake
export type DelegatedStake = {
  source: string;
  nodeId: string;
  amount: number;
  fee?: number;
  tokenLockRef: string;
};

export type DelegatedStakeWithParent = WithParent<DelegatedStake>;
export type SignedDelegatedStake = SignedOperation<DelegatedStakeWithParent>;

// Withdraw Delegated Stake
export type WithdrawDelegatedStake = {
  source: string;
  stakeRef: string;
};

export type SignedWithdrawDelegatedStake =
  SignedOperation<WithdrawDelegatedStake>;

// Operation response

export type HashResponse = {
  hash: string;
};
