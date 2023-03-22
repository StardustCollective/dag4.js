import { RestApi } from "@stardust-collective/dag4-core";
import {
  ClusterInfoV2,
  ClusterPeerInfoV2,
  TransactionReference,
  PostTransactionV2,
  PendingTransaction,
  PostTransactionResponseV2,
} from "../../dto/v2";

class StateChannelTokenL1Api {
  private service: RestApi;

  constructor(host: string) {
    this.service = new RestApi(host);
  }

  config() {
    return this.service.configure();
  }

  async getAddressLastAcceptedTransactionRef(address: string) {
    return this.service.$get<TransactionReference>(
      `/transactions/last-reference/${address}`
    );
  }

  async getPendingTransaction(hash: string) {
    return this.service.$get<PendingTransaction>(`/transactions/${hash}`);
  }

  async postTransaction(tx: PostTransactionV2) {
    return this.service.$post<PostTransactionResponseV2>("/transactions", tx);
  }

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
    } else {
      return new Promise<ClusterPeerInfoV2[]>((resolve) => {
        setTimeout(() => {
          resolve(this.getClusterInfoWithRetry());
        }, 1000);
      });
    }
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
}

export { StateChannelTokenL1Api };
