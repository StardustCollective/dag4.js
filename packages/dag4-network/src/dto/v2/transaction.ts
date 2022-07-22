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
    salt: bigint | string
}

export type TransactionV2 = {
  hash: string
  source: string
  destination: string
  amount: number
  fee: number
  parent: TransactionReference 
  snapshot: string
  block: string
  timestamp: string
  transactionOriginal: TransactionReference
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

export type GetTransactionResponseV2 = {
  data: TransactionV2
}