import { RestApi } from "@stardust-collective/dag4-core";
import { DNC } from "../../DNC";
import {
  ClusterInfoV2,
  ClusterPeerInfoV2,
  TransactionReference,
  PostTransactionV2,
  PendingTransaction,
  PostTransactionResponseV2,
} from "../../dto/v2";

class L1Api {
  protected service = new RestApi(DNC.L1_URL);

  constructor(host?: string) {
    if (host) {
      this.config().baseUrl(host);
    }
  }

  config() {
    return this.service.configure();
  }

  async getMetrics() {
    // TODO: add parsing for v2 response... returns 404
    return this.service.$get<string>("/metric");
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

const l1Api = new L1Api();

export { L1Api, l1Api };
