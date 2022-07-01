import { PeerNodeState } from './peer-metrics';
export declare type PeerAddressBalance = {
    tps10: number;
    tpsAll: number;
    height: number;
    balance?: number;
    latency: number;
    rewardsBalance: number;
};
export declare type PeerGridStatus = {
    status: PeerNodeState;
    isConnected: boolean;
};
export declare type PeerGridItem = PeerAddressBalance & PeerGridStatus & {
    deltaBalance?: number;
    deltaReward?: number;
};
export declare type PeerGridBalance = {
    addressKey: string;
    rowIndex: number;
    colIndex: number;
    balance: number;
};
export declare type PeerGridHeight = {
    count: number;
    loc: {
        [loc: string]: PeerGridBalance;
    };
};
export declare type NodeAggrMetrics = {
    tps10: number;
    tpsAll: number;
    balance: number;
    rewards: number;
    latency: number;
    deltaReward: number;
    predictive?: boolean;
};
export declare type ClusterHourlyAggr = {
    cluster: {
        height: number;
        totalRewards: number;
    };
    nodes: NodeHourlyAggrByIdName;
};
export declare type NodeHourlyAggrByIdName = {
    [idName: string]: NodeAggrMetrics;
};
export declare type FbPeerMetricsWindow = {
    cursorIndex: number;
    window: PeerMetricsWindow[];
};
export declare type PeerMetricsWindow = {
    date: number;
    height: number;
    peerMetrics: {
        [idName: string]: PeerGridItem;
    };
};
