export type TransactionReference = {
  hash: string
  ordinal: number
}

// TODO: not actually defined, fill from API response
export type TransactionOriginal = {
  hash: string
  ordinal: number
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
  transactionOriginal: TransactionOriginal // TODO: this isn't defined in docs
}

export type Proof = {
  signature: string,
  id: string
};

export type PostTransactionV2 = {
  value: {
     source: string,
     destination: string,
     amount: number,
     fee: number,
     parent: TransactionReference,
     salt: bigint | string
  },
  proofs: Proof[]
};