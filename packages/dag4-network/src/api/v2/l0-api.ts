import { RestApi } from "@stardust-collective/dag4-core";

import { DNC } from "../../DNC";
import {
  ClusterInfoV2,
  ClusterPeerInfoV2,
  L0AddressBalance,
  SnapshotOrdinal,
  TotalSupplyV2,
} from "../../dto/v2";

class L0Api {
  protected service = new RestApi(DNC.L0_URL);

  constructor(host?: string) {
    if (host) {
      this.config().baseUrl(host);
    }
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

  // Metrics
  async getMetrics() {
    // TODO: add parsing for v2 response... returns weird string
    return this.service.$get<string>("/metric");
  }

  // DAG
  async getTotalSupply() {
    return this.service.$get<TotalSupplyV2>("/dag/total-supply");
  }

  async getTotalSupplyAtOrdinal(ordinal: number) {
    return this.service.$get<TotalSupplyV2>(`/dag/${ordinal}/total-supply`);
  }

  async getAddressBalance(address: string) {
    return this.service.$get<L0AddressBalance>(`/dag/${address}/balance`);
  }

  async getAddressBalanceAtOrdinal(ordinal: number, address: string) {
    return this.service.$get<L0AddressBalance>(
      `/dag/${ordinal}/${address}/balance`
    );
  }

  // Global Snapshot
  async getLatestSnapshot() {
    return this.service.$get<string>(
      `/global-snapshots/latest`,
      {},
      { headers: { Accept: "application/json" } }
    );
  }

  async getLatestSnapshotOrdinal() {
    return this.service.$get<SnapshotOrdinal>(
      `/global-snapshots/latest/ordinal`
    );
  }

  async getSnapshot(id: string | number) {
    return this.service.$get<string>(
      `/global-snapshots/${id}`,
      {},
      { headers: { Accept: "application/json" } }
    );
  }

  // State Channels
  async postStateChannelSnapshot(address: string, snapshot: string) {
    return this.service.$post<any>(
      `/state-channel/${address}/snapshot`,
      snapshot
    );
  }
}

const l0Api = new L0Api();

export { L0Api, l0Api };
