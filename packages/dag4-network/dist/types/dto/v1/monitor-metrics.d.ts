import { PeerMetricsRawData, PeerNodeState } from './peer-metrics';
export declare type MonitorMetrics = {
    lastUpdated: string;
    lastUpdatedMS: number;
    cluster: ClusterMonitorMetrics;
    nodes: PeerMonitorMetrics[];
};
export declare class PeerMonitorMetrics {
    userId: string;
    walletId: string;
    latency: number;
    nodeState: PeerNodeState;
    nodeStartTimeAgo: string;
    nodeStartTime: number;
    externalHost: string;
    TPS_all: number;
    TPS_last_10_seconds: number;
    version: string;
    nextSnapshotHeight: number;
    snapshotAttempt_failure: number;
    address: string;
    majorityHeight: number;
    rewardsBalance: number;
    addressBalance: number;
    pending?: boolean;
    alias: string;
    label?: string;
    star?: boolean;
    rocRewards?: number;
    rocTps10?: number;
    rocTpsAll?: number;
    rocLatency?: number;
    rocPredictive?: boolean;
    static createAsPending(host: string, status: PeerNodeState): PeerMonitorMetrics;
    static parse(rawMetrics: PeerMetricsRawData, latency: number): PeerMonitorMetrics;
}
export declare class ClusterMonitorMetrics {
    validatorCount: number;
    version: string;
    avgTps: number;
    totalTps: number;
    maxHeight: number;
    totalRewards: number;
    tooltip?: string;
    rocTotalRewards?: number;
    rocMaxHeight?: number;
    stardustWalletBalance: number;
}
