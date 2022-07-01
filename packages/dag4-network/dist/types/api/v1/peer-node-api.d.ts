import { PeerMetricsRawData, PeerMetrics } from '../../dto/v1/peer-metrics';
import { ClusterPeerInfo } from '../../dto/v1/cluster-peer-info';
import { AddressBalance, AddressLastAcceptedTransaction, TotalSupply, Transaction } from '../../dto/v1';
export declare class PeerNodeApi {
    private mHost;
    private service;
    constructor(mHost?: string);
    getHealth(): Promise<any>;
    getMetrics(): Promise<PeerMetrics>;
    getMicroMetrics(): Promise<any>;
    getTotalSupply(): Promise<TotalSupply>;
    getAddressBalance(address: string): Promise<AddressBalance>;
    getAddressLastAcceptedTransactionRef(address: string): Promise<AddressLastAcceptedTransaction>;
    postTransaction(tx: any): Promise<string>;
    checkTransaction(hash: string): Promise<Transaction>;
    getClusterInfo(): Promise<ClusterPeerInfo[]>;
    set host(val: string);
    get host(): string;
    private processClusterInfo;
}
export declare const peerNodeApi: PeerNodeApi;
export declare type PeerMetricsResponse = {
    "metrics": PeerMetricsRawData;
};
