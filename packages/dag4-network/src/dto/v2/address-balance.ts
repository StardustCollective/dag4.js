import { SnapshotOrdinal } from './total-supply';

export type AddressBalanceV2 = {
  balance: number
  ordinal: number
};

export type L0AddressBalance = {
  balance: number
  ordinal: SnapshotOrdinal
};