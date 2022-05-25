import {PeerMetricsRawData, PeerNodeState} from './peer-metrics'


export type MonitorMetrics = {
  lastUpdated: string;
  lastUpdatedMS: number;
  cluster: ClusterMonitorMetrics;
  nodes: PeerMonitorMetrics[];
}

export class PeerMonitorMetrics {
  userId: string;
  walletId: string;
  latency: number;
  nodeState: PeerNodeState;
  nodeStartTimeAgo: string;
  nodeStartTime: number
  externalHost: string;
  TPS_all: number
  TPS_last_10_seconds: number;
  version: string;
  nextSnapshotHeight: number;
  snapshotAttempt_failure: number;
  address: string
  majorityHeight: number;
  rewardsBalance: number;
  addressBalance: number;
  pending?: boolean;
  alias: string;
  //anchor?: string;
  label?: string;
  star?: boolean;
  rocRewards?: number;
  rocTps10?: number;
  rocTpsAll?: number;
  rocLatency?: number;
  rocPredictive?: boolean;

  static createAsPending (host: string, status: PeerNodeState) {
    const result = new PeerMonitorMetrics();

    result.pending = true;
    result.nodeState = status;
    result.externalHost = host;

    return result;
  }

  static parse(rawMetrics: PeerMetricsRawData, latency: number) : PeerMonitorMetrics {
    const result = new PeerMonitorMetrics();

    result.latency = latency;

    result.alias = rawMetrics.alias;
    result.walletId = rawMetrics.id;
    result.version = rawMetrics.version;
    result.address = rawMetrics.address;
    result.nodeState = rawMetrics.nodeState as PeerNodeState;
    result.nodeStartTime = +rawMetrics.nodeStartTimeMS;
    result.externalHost = rawMetrics.externalHost;
    result.TPS_all = +rawMetrics.TPS_all;
    result.TPS_last_10_seconds = +rawMetrics.TPS_last_10_seconds;
    result.nextSnapshotHeight = +rawMetrics.nextSnapshotHeight;
    result.snapshotAttempt_failure = +rawMetrics.snapshotAttempt_failure || 0;
    result.majorityHeight = +rawMetrics.redownload_lastMajorityStateHeight || 0;

    return result;
  }
}

export class ClusterMonitorMetrics {
  validatorCount = 0;
  version = '';
  avgTps = 0;
  totalTps = 0;
  maxHeight = 0;
  totalRewards = 0;
  tooltip?: string;
  rocTotalRewards?: number;
  rocMaxHeight?: number;
  stardustWalletBalance = 0;
}
