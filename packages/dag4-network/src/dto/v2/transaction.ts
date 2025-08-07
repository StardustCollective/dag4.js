import { BigNumber } from "bignumber.js";
import type { Transaction } from "../v1";

export type TransactionReference = {
  hash: string
  ordinal: number
}

type TransactionValueV2 = {
    source: string,
    destination: string,
    amount: number,
    fee: number,
    parent: TransactionReference,
    salt: BigNumber | string
}

export type TransactionV2 = {
  hash: string
  ordinal: number
  source: string
  destination: string
  amount: number
  fee: number
  parent: TransactionReference
  salt: number
  blockHash: string
  snapshotHash: string
  snapshotOrdinal: number
  transactionOriginal?: {
    value: TransactionValueV2,
    proofs: Proof[]
  } | null
  timestamp: string
  globalSnapshotHash: string
  globalSnapshotOrdinal: number
}

export type PendingTransaction = {
  transaction: TransactionValueV2
  hash: string
  status: string
}

export type Proof = {
  signature: string,
  id: string
};

export type PostTransactionV2 = {
  value: TransactionValueV2,
  proofs: Proof[]
};

export type PostTransactionResponseV2 = {
  hash: string
};
