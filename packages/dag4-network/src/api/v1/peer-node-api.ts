
import {RestApi} from '@stardust-collective/dag4-core';

import {PeerMetricsRawData, PeerMetrics} from '../../dto/v1/peer-metrics';
import {ClusterInfo, ClusterPeerInfo} from '../../dto/v1/cluster-peer-info';
import {AddressBalance, AddressLastAcceptedTransaction, TotalSupply, Transaction} from '../../dto/v1';

export class PeerNodeApi {

  private service = new RestApi('');

  constructor (private mHost: string = '') {}

  //health ping
  async getHealth () {
    return this.service.$get<any>('health');
  }

  async getMetrics (): Promise<PeerMetrics> {
    const startTime = Date.now();
    //, null, { retry: 1 }
    return this.service.$get<PeerMetricsResponse>('metrics').then(rawData => PeerMetrics.parse(rawData.metrics, Date.now() - startTime));
  }

  //micrometer-metrics
  async getMicroMetrics () {
    return this.service.$get<any>('micrometer-metrics');
  }

  async getTotalSupply () {
    return this.service.$get<TotalSupply>('total-supply');
  }

  async getAddressBalance (address: string) {
    return this.service.$get<AddressBalance>('/address/' + address);
  }

  async getAddressLastAcceptedTransactionRef (address: string) {
    return this.service.$get<AddressLastAcceptedTransaction>('/transaction/last-ref/' + address);
  }

  async postTransaction (tx: any) {
    return this.service.$post<string>('/transaction', tx);
  }

  async checkTransaction (hash: string) {
    return this.service.$get<Transaction>('/transaction/' + hash);
  }

  getClusterInfo (): Promise<ClusterPeerInfo[]> {
    return this.service.$get<ClusterInfo[]>('cluster/info').then(info => this.processClusterInfo(info));
  }

  set host(val: string) {
    if (!val.startsWith('http')) {
      val = 'http://' + val;
    }
    if (!val.includes(':', 8)) {
      val = val+ ':9000/';
    }
    this.mHost = val;
    this.service.configure().baseUrl(val);
  }

  get host () {
    return this.mHost;
  }

  private processClusterInfo (info: ClusterInfo[]): ClusterPeerInfo[] {
    return info && info.map(d => ({ alias: d.alias, walletId: d.id.hex, ip: d.ip.host, status: d.status, reputation: d.reputation }));
  }
}

export const peerNodeApi = new PeerNodeApi();

export type PeerMetricsResponse = {
  "metrics": PeerMetricsRawData
}
