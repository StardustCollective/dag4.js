import { AddressBalance, AddressLastAcceptedTransaction, TotalSupply } from '../../dto/v1';
import { ClusterPeerInfo } from '../../dto/v1';
import { PeerMetrics } from '../../dto/v1/peer-metrics';
import { CbTransaction } from '../../dto/v1/cb-transaction';
export declare class LoadBalancerApi {
    private service;
    constructor(host?: string);
    config(): import("@stardust-collective/dag4-core").RestConfig;
    getMetrics(): Promise<PeerMetrics>;
    getAddressBalance(address: string): Promise<AddressBalance>;
    getAddressLastAcceptedTransactionRef(address: string): Promise<AddressLastAcceptedTransaction>;
    getTotalSupply(): Promise<TotalSupply>;
    postTransaction(tx: any): Promise<string>;
    getTransaction(hash: string): Promise<CbTransaction>;
    checkTransactionStatus(hash: string): Promise<{
        accepted: boolean;
        inMemPool: boolean;
    }>;
    getClusterInfo(): Promise<ClusterPeerInfo[]>;
    getClusterInfoWithRetry(): Promise<ClusterPeerInfo[]>;
    activeNodeCount(): Promise<number>;
    private retryClusterInfo;
    private processClusterInfo;
}
export declare const loadBalancerApi: LoadBalancerApi;
