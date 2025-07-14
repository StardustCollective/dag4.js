
export type BlockReference = {
  hash: string
  height: number
}

export type BlockV2 = {
  hash: string
  height: number
  parents: BlockReference[]
  timestamp: string
  transactions: string[]
  snapshotHash: string
  snapshotOrdinal: number
}