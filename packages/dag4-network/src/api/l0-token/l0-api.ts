import { RestApi } from "@stardust-collective/dag4-core";

import {
  ClusterInfoV2,
  ClusterPeerInfoV2,
  L0AddressBalance,
  SnapshotOrdinal,
  TotalSupplyV2,
} from "../../dto/v2";

class L0TokenL0Api {
  private service: RestApi;

  constructor(host: string) {
    this.service = new RestApi(host);
  }

  config() {
    return this.service.configure();
  }

  // Cluster Info
  async getClusterInfo(): Promise<ClusterPeerInfoV2[]> {
    return this.service
      .$get<ClusterInfoV2[]>("/cluster/info")
      .then((info) => this.processClusterInfo(info));
  }

  async getClusterInfoWithRetry(): Promise<ClusterPeerInfoV2[]> {
    return this.service
      .$get<ClusterInfoV2[]>("/cluster/info", null, { retry: 5 })
      .then((info) => this.retryClusterInfo(info));
  }

  private retryClusterInfo(info: ClusterInfoV2[]) {
    if (info && info.map) {
      return this.processClusterInfo(info);
    }

    return new Promise<ClusterPeerInfoV2[]>((resolve) => {
      setTimeout(() => {
        resolve(this.getClusterInfoWithRetry());
      }, 1000);
    });
  }

  private processClusterInfo(info: ClusterInfoV2[]): ClusterPeerInfoV2[] {
    return (
      info &&
      info.map &&
      info.map((d) => ({
        alias: d.alias,
        walletId: d.id.hex,
        ip: d.ip.host,
        status: d.status,
        reputation: d.reputation,
      }))
    );
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

  // Global Snapshot
  // TODO: returns weird string
  async getLatestSnapshot() {
    return this.service.$get<string>(`/snapshots/latest`);
  }

  async getLatestSnapshotOrdinal() {
    return this.service.$get<SnapshotOrdinal>(`/snapshots/latest/ordinal`);
  }

  // TODO: returns weird string
  async getSnapshot(id: string | number) {
    return this.service.$get<string>(`/snapshots/${id}`);
  }
}

export { L0TokenL0Api };
