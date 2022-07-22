import {PeerNodeState} from './peer-metrics';


export type PeerAddressBalance = {
  tps10: number;
  tpsAll: number;
  height: number;
  balance?: number;
  latency: number;
  rewardsBalance: number;
}

export type PeerGridStatus = {
  status: PeerNodeState;
  isConnected: boolean;
}

export type PeerGridItem = PeerAddressBalance & PeerGridStatus & {
  deltaBalance?: number;
  deltaReward?: number;
}

export type PeerGridBalance = {
  addressKey: string;
  rowIndex: number;
  colIndex: number;
  balance: number;
}

export type PeerGridHeight = {
  count: number;
  loc: {[loc: string]: PeerGridBalance };
}

export type NodeAggrMetrics = {
  tps10: number;
  tpsAll: number;
  balance: number;
  rewards: number;
  latency: number;
  deltaReward: number;
  predictive?: boolean;
}

export type ClusterHourlyAggr = {
  cluster: { height: number, totalRewards: number},
  nodes: NodeHourlyAggrByIdName
}

export type NodeHourlyAggrByIdName = {
  [idName: string]: NodeAggrMetrics
}

export type FbPeerMetricsWindow = {
  cursorIndex: number;
  window: PeerMetricsWindow[];
}

export type PeerMetricsWindow = {
  date: number;
  height: number;
  peerMetrics: {[idName: string]: PeerGridItem };
}
