import {RestApi} from '@stardust-collective/dag4-core';
import {DNC} from '../../DNC';
import {ClusterInfo, ClusterPeerInfo, TransactionReference, PostTransactionV2} from '../../dto/v2';

export class L1Api {

  private service = new RestApi(DNC.L1_URL);

  constructor (host?: string) {
    if (host) {
      this.config().baseUrl(host);
    }
  }

  config () {
    return this.service.configure();
  }

  async getMetrics () {
    // TODO: add parsing for v2 response... returns 404
    return this.service.$get<string>('/metric');
  }

  async getAddressLastAcceptedTransactionRef (address: string) {
    return this.service.$get<TransactionReference>(`/transaction/last-reference/${address}`);
  }

  async postTransaction (tx: PostTransactionV2) {
    return this.service.$post<string>('/transaction', tx);
  }

  async getClusterInfo (): Promise<ClusterPeerInfo[]> {
    return this.service.$get<ClusterInfo[]>('/cluster/info').then(info => this.processClusterInfo(info))
  }

  async getClusterInfoWithRetry (): Promise<ClusterPeerInfo[]> {
    return this.service.$get<ClusterInfo[]>('/cluster/info', null, { retry: 5 }).then(info => this.retryClusterInfo(info))
  }

  private retryClusterInfo (info: ClusterInfo[]) {
    if (info && info.map) {
      return this.processClusterInfo(info);
    }
    else {
      return new Promise<ClusterPeerInfo[]>(resolve => {
        setTimeout(() => {
          resolve(this.getClusterInfoWithRetry());
        }, 1000)
      });

    }
  }

  private processClusterInfo (info: ClusterInfo[]): ClusterPeerInfo[] {
    return info && info.map && info.map(d => ({ alias: d.alias, walletId: d.id.hex, ip: d.ip.host, status: d.status, reputation: d.reputation }));
  }
}

export const l1Api = new L1Api();

