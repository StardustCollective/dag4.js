import { ClusterPeerInfo, TransactionReference, PostTransactionV2 } from '../../dto/v2';
export declare class L1Api {
    private service;
    constructor(host?: string);
    config(): import("@stardust-collective/dag4-core").RestConfig;
    getMetrics(): Promise<string>;
    getAddressLastAcceptedTransactionRef(address: string): Promise<TransactionReference>;
    postTransaction(tx: PostTransactionV2): Promise<string>;
    getClusterInfo(): Promise<ClusterPeerInfo[]>;
    getClusterInfoWithRetry(): Promise<ClusterPeerInfo[]>;
    private retryClusterInfo;
    private processClusterInfo;
}
export declare const l1Api: L1Api;
