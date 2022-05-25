import {RestApi} from '@stardust-collective/dag4-core';

import {DNC} from '../DNC';
import {AddressBalance, AddressLastAcceptedTransaction, TotalSupply, Transaction} from '../dto/v1';
import {ClusterInfo, ClusterPeerInfo} from '../dto/v1';
import {PeerMetrics} from '../dto/v1/peer-metrics';
import {PeerMetricsResponse} from './peer-node-api';
import {CbTransaction} from '../dto/v1/cb-transaction';

export class L0Api {

  private service = new RestApi(DNC.L0_URL);

  constructor (host?: string) {
    if (host) {
      this.config().baseUrl(host);
    }
  }

  config () {
    return this.service.configure();
  }

  async getMetrics () {
    // TODO: add parsing for v2 response... returns weird string
    return this.service.$get<PeerMetricsResponse>('/metric').then(rawData => PeerMetrics.parse(rawData.metrics, 0));
  }

  async getAddressBalance (address: string) {
    return this.service.$get<AddressBalance>(`/dag/${address}/balance`);
  }

  async getAddressLastAcceptedTransactionRef (address: string) {
    return this.service.$get<AddressLastAcceptedTransaction>('/transaction/last-ref/' + address);
  }

  async getTotalSupply () {
    return this.service.$get<TotalSupply>('/dag/total-supply');
  }

  async getTotalSupplyAtOrdinal (ordinal: number) {
    return this.service.$get<TotalSupply>(`/dag/${ordinal}/total-supply`);
  }

  // In block explorer API?
  // async getTransaction (hash: string) {
  //   return this.service.$get<CbTransaction>('/transaction/' + hash);
  // }

  async getClusterInfo (): Promise<ClusterPeerInfo[]> {
    return this.service.$get<ClusterInfo[]>('/cluster/info').then(info => this.processClusterInfo(info))
  }

  async getClusterInfoWithRetry (): Promise<ClusterPeerInfo[]> {
    return this.service.$get<ClusterInfo[]>('/cluster/info', null, { retry: 5 }).then(info => this.retryClusterInfo(info))
  }

  //Returns number of connected Nodes in Cluster
  // async activeNodeCount () {
  //   return this.service.$get<number>('/utils/health');
  // }

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

export const l0Api = new L0Api();

