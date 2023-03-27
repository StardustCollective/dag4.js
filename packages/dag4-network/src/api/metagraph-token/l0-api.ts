import {
  L0AddressBalance,
  TotalSupplyV2,
} from "../../dto/v2";
import { L0Api } from "../v2/l0-api";

class MetagraphTokenL0Api extends L0Api {
  constructor(host: string) {
    super(host);
  }

  // State Channel Token
  async getTotalSupply() {
    return this.service.$get<TotalSupplyV2>("/currency/total-supply");
  }

  async getTotalSupplyAtOrdinal(ordinal: number) {
    return this.service.$get<TotalSupplyV2>(
      `/currency/${ordinal}/total-supply`
    );
  }

  async getAddressBalance(address: string) {
    return this.service.$get<L0AddressBalance>(`/currency/${address}/balance`);
  }

  async getAddressBalanceAtOrdinal(ordinal: number, address: string) {
    return this.service.$get<L0AddressBalance>(
      `/currency/${ordinal}/${address}/balance`
    );
  }
}

export { MetagraphTokenL0Api };
