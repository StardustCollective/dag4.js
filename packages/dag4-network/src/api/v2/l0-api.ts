import {RestApi} from '@stardust-collective/dag4-core';

import {DNC} from '../../DNC';
import {ClusterInfo, ClusterPeerInfo, L0AddressBalance, SnapshotOrdinal, TotalSupply} from '../../dto/v2';

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

  // Cluster Info
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

    return new Promise<ClusterPeerInfo[]>(resolve => {
      setTimeout(() => {
        resolve(this.getClusterInfoWithRetry());
      }, 1000)
    });
  }

  private processClusterInfo (info: ClusterInfo[]): ClusterPeerInfo[] {
    return info && info.map && info.map(d => ({ alias: d.alias, walletId: d.id.hex, ip: d.ip.host, status: d.status, reputation: d.reputation }));
  }

  // Metrics
  async getMetrics () {
    // TODO: add parsing for v2 response... returns weird string
    return this.service.$get<string>('/metric'); 
  }

  // DAG
  async getTotalSupply () {
    return this.service.$get<TotalSupply>('/dag/total-supply');
  }

  async getTotalSupplyAtOrdinal (ordinal: number) {
    return this.service.$get<TotalSupply>(`/dag/${ordinal}/total-supply`);
  }
 
  async getAddressBalance (address: string) {
    return this.service.$get<L0AddressBalance>(`/dag/${address}/balance`);
  }

  async getAddressBalanceAtOrdinal (ordinal: number, address: string) {
    return this.service.$get<L0AddressBalance>(`/dag/${ordinal}/${address}/balance`);
  }

  // Global Snapshot
  // TODO: returns weird string
  async getLatestSnapshot() {
    return this.service.$get<string>(`/global-snapshot/latest`);
  }

  async getLatestSnapshotOrdinal() {
    return this.service.$get<SnapshotOrdinal>(`/global-snapshot/latest/ordinal`);
  }
  
    // TODO: returns weird string
  async getSnapshot(id: string | number) {
    return this.service.$get<string>(`/global-snapshot/${id}`);
  }

  // State Channels
  async postStateChannelSnapshot(address: string, snapshot: string) {
    return this.service.$post<any>(`/state-channel/${address}/snapshot`, snapshot);
  }
}

export const l0Api = new L0Api();

