import { SnapshotOrdinal } from './total-supply';

export type AddressBalance = {
  balance: number
  ordinal: number
};

export type L0AddressBalance = {
  balance: number
  ordinal: SnapshotOrdinal
};