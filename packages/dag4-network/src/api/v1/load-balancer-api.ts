import {RestApi} from '@stardust-collective/dag4-core';

import {DNC} from '../../DNC';
import {AddressBalance, AddressLastAcceptedTransaction, TotalSupply, Transaction} from '../../dto/v1';
import {ClusterInfo, ClusterPeerInfo} from '../../dto/v1';
import {PeerMetrics} from '../../dto/v1/peer-metrics';
import {PeerMetricsResponse} from './peer-node-api';
import {CbTransaction} from '../../dto/v1/cb-transaction';

export class LoadBalancerApi {

  private service = new RestApi(DNC.LOAD_BALANCER_URL);

  constructor (host?: string) {
    if (host) {
      this.config().baseUrl(host);
    }
  }

  config () {
    return this.service.configure();
  }

  async getMetrics () {
    return this.service.$get<PeerMetricsResponse>('/metrics').then(rawData => PeerMetrics.parse(rawData.metrics, 0));
  }

  async getAddressBalance (address: string) {
    return this.service.$get<AddressBalance>('/address/' + address);
  }

  async getAddressLastAcceptedTransactionRef (address: string) {
    return this.service.$get<AddressLastAcceptedTransaction>('/transaction/last-ref/' + address);
  }

  async getTotalSupply () {
    return this.service.$get<TotalSupply>('/total-supply');
  }

  async postTransaction (tx: any) {
    return this.service.$post<string>('/transaction', tx);
  }

  async getTransaction (hash: string) {
    return this.service.$get<CbTransaction>('/transaction/' + hash);
  }

  async checkTransactionStatus (hash: string) {
    const tx = await this.service.$get<CbTransaction>('/transaction/' + hash);

    if (tx) {
      if (tx.cbBaseHash) {
        return { accepted: true, inMemPool: false };
      }
      return { accepted: false, inMemPool: true };
    }

    return null;
  }

  async getClusterInfo (): Promise<ClusterPeerInfo[]> {
    return this.service.$get<ClusterInfo[]>('/cluster/info').then(info => this.processClusterInfo(info))
  }

  async getClusterInfoWithRetry (): Promise<ClusterPeerInfo[]> {
    return this.service.$get<ClusterInfo[]>('/cluster/info', null, { retry: 5 }).then(info => this.retryClusterInfo(info))
  }

  //Returns number of connected Nodes in Cluster
  async activeNodeCount () {
    return this.service.$get<number>('/utils/health');
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

export const loadBalancerApi = new LoadBalancerApi();

