import { ClusterPeerInfo, L0AddressBalance, SnapshotOrdinal, TotalSupply } from '../../dto/v2';
export declare class L0Api {
    private service;
    constructor(host?: string);
    config(): import("@stardust-collective/dag4-core").RestConfig;
    getClusterInfo(): Promise<ClusterPeerInfo[]>;
    getClusterInfoWithRetry(): Promise<ClusterPeerInfo[]>;
    private retryClusterInfo;
    private processClusterInfo;
    getMetrics(): Promise<string>;
    getTotalSupply(): Promise<TotalSupply>;
    getTotalSupplyAtOrdinal(ordinal: number): Promise<TotalSupply>;
    getAddressBalance(address: string): Promise<L0AddressBalance>;
    getAddressBalanceAtOrdinal(ordinal: number, address: string): Promise<L0AddressBalance>;
    getLatestSnapshot(): Promise<string>;
    getLatestSnapshotOrdinal(): Promise<SnapshotOrdinal>;
    getSnapshot(id: string | number): Promise<string>;
    postStateChannelSnapshot(address: string, snapshot: string): Promise<any>;
}
export declare const l0Api: L0Api;
