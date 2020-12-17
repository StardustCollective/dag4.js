import {PeerMetrics, PeerNodeState} from '@stardust-collective/dag4-network/dto/peer-metrics'

export type PeerHealth = {
  index: number;
  host: string;
  userId: string;
  nodeAlias: string;
  isReady: boolean;
  metrics: PeerMetrics;
  status: PeerNodeState;
  addressKey: string;
  serverNotResponding: boolean;
}
