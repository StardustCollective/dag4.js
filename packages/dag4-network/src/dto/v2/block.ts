// TODO: confirm through API, not defined in API doc
export type HeightV2 = {
  min: number
  max: number
}

export type BlockReference = {
  hash: string
  height: HeightV2
}

export type BlockV2 = {
  hash: string
  timestamp: string
  snapshot: string
  height: HeightV2
  transactions: string[]
  parent: BlockReference
}