
import {PeerMetricsRawData, PeerMetrics} from '../dto/peer-metrics';
import {ClusterInfo, ClusterPeerInfo} from '../dto/cluster-peer-info';
import {RestApi} from '@stardust-collective/dag4-core';

class PeerNodeApi {

  private service = new RestApi('');

  async getMajorityHeight (host: string) {
    this.host = host + ':9002/';
    return this.service.$get<any>('metrics');
  }

  async getMetrics (host: string): Promise<PeerMetrics> {
    this.host = host;
    const startTime = Date.now();
    return this.service.$get<PeerMetricsResponse>('metrics').then(rawData => PeerMetrics.parse(rawData.metrics, Date.now() - startTime));
  }

  //health ping
  async getHealth (host: string) {
    this.host = host;
    return this.service.$get<any>('health');
  }

  //micrometer-metrics
  async getMicroMetrics (host: string) {
    this.host = host;
    return this.service.$get<any>('micrometer-metrics');
  }

  //?? not sure of the use. requires KeyPair(public, private)
  async signEndpoint (host: string, keyPair: string) {
    this.host = host;
    return this.service.$get<any>('sign');
  }

  getClusterInfo (host: string): Promise<ClusterPeerInfo[]> {
    this.host = host;
    return this.service.$get<ClusterInfo[]>('cluster/info').then(info => this.processClusterInfo(info));
  }

  private set host(val: string) {
    if (!val.startsWith('http')) {
      val = 'http://' + val;
    }
    this.service.configure().baseUrl(val + ':9000/');
  }

  private processClusterInfo (info: ClusterInfo[]): ClusterPeerInfo[] {
    return info && info.map(d => ({ alias: d.alias, walletId: d.id.hex, ip: d.ip.host, status: d.status, reputation: d.reputation }));
  }
}

export const peerNodeApi = new PeerNodeApi();

export type PeerMetricsResponse = {
  "metrics": PeerMetricsRawData
}
