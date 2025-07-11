import { SnapshotOrdinal } from './total-supply';

export type AddressBalanceV2 = {
  balance: number
  ordinal: number
  address: string
};

export type L0AddressBalance = {
  balance: number
  ordinal: SnapshotOrdinal
};