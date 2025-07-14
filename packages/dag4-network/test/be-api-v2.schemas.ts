import { z } from 'zod';

// Helper schemas for nested types
export const TransactionReferenceSchema = z.object({
  hash: z.string(),
  ordinal: z.number()
});

export const BlockReferenceSchema = z.object({
  hash: z.string(),
  height: z.number()
});

export const ProofSchema = z.object({
  signature: z.string(),
  id: z.string()
});

export const TransactionValueV2Schema = z.object({
  source: z.string(),
  destination: z.string(),
  amount: z.number(),
  fee: z.number(),
  parent: TransactionReferenceSchema,
  salt: z.union([z.string(), z.number()]) // BigNumber or string
});

// Core data type schemas
export const TransactionV2Schema = z.object({
  hash: z.string(),
  ordinal: z.number(),
  source: z.string(),
  destination: z.string(),
  amount: z.number(),
  fee: z.number(),
  parent: TransactionReferenceSchema,
  salt: z.number(),
  blockHash: z.string(),
  snapshotHash: z.string(),
  snapshotOrdinal: z.number(),
  transactionOriginal: z.object({
    value: TransactionValueV2Schema,
    proofs: z.array(ProofSchema)
  }).nullable(),
  timestamp: z.string(),
  globalSnapshotHash: z.string(),
  globalSnapshotOrdinal: z.number()
});

export const SnapshotV2Schema = z.object({
  hash: z.string(),
  ordinal: z.number(),
  height: z.number(),
  subHeight: z.number(),
  lastSnapshotHash: z.string(),
  blocks: z.array(z.string()),
  epochProgress: z.number().nullable().optional(),
  timestamp: z.string(),
  metagraphSnapshotCount: z.number().nullable().optional()
});

export const RewardTransactionSchema = z.object({
  destination: z.string(),
  amount: z.number()
});

export const AddressBalanceV2Schema = z.object({
  balance: z.number(),
  address: z.string(),
  ordinal: z.number()
});

export const CurrencySnapshotV2Schema = z.object({
  hash: z.string(),
  ordinal: z.number(),
  height: z.number(),
  subHeight: z.number(),
  lastSnapshotHash: z.string(),
  blocks: z.array(z.string()),
  epochProgress: z.number(),
  timestamp: z.string(),
  fee: z.number().nullable().optional(),
  stakingAddress: z.string().nullable().optional(),
  ownerAddress: z.string().nullable().optional(),
  sizeInKB: z.number().nullable().optional()
});

export const BlockV2Schema = z.object({
  hash: z.string(),
  height: z.number(),
  parents: z.array(BlockReferenceSchema),
  timestamp: z.string(),
  transactions: z.array(z.string()),
  snapshotHash: z.string(),
  snapshotOrdinal: z.number()
});

// Response wrapper schemas
export const ResponseMetadataSchema = z.object({
  next: z.string()
}).optional();

export const ResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) => z.object({
  data: z.union([
    dataSchema,
    z.array(dataSchema),
    z.null()
  ])
});

export const ResponseWithMetadataSchema = <T extends z.ZodTypeAny>(dataSchema: T) => z.object({
  data: z.union([
    dataSchema,
    z.array(dataSchema),
    z.null()
  ]),
  meta: ResponseMetadataSchema
});

// Schema mapping for easy access
export const DATA_SCHEMAS = {
  TransactionV2: TransactionV2Schema,
  SnapshotV2: SnapshotV2Schema,
  RewardTransaction: RewardTransactionSchema,
  AddressBalanceV2: AddressBalanceV2Schema,
  CurrencySnapshotV2: CurrencySnapshotV2Schema,
  BlockV2: BlockV2Schema
} as const;

export type DataSchemaKeys = keyof typeof DATA_SCHEMAS; 