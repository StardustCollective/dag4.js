import { PeerMetrics, PeerNodeState } from './peer-metrics';
export declare type PeerHealth = {
    index: number;
    host: string;
    userId: string;
    nodeAlias: string;
    isReady: boolean;
    metrics: PeerMetrics;
    status: PeerNodeState;
    addressKey: string;
    serverNotResponding: boolean;
};
