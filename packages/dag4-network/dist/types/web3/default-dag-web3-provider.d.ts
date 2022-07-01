import { NetworkInfo } from "../types";
import { Transaction } from "../dto/v1";
export declare class DefaultDagWeb3Provider {
    private loadBalancerApi;
    private blockExplorerApi;
    private connectedNetwork;
    constructor(netInfo?: NetworkInfo);
    config(netInfo?: NetworkInfo): NetworkInfo;
    setNetwork(netInfo: NetworkInfo): void;
    getBalance(address: string): Promise<number>;
    getTransactionCount(address: string): Promise<number>;
    getTransactionHistory(address: string, limit?: number): Promise<Transaction[]>;
    getTokenTransactionHistory(address: string, limit?: number): Promise<Transaction[]>;
    getTokenAddressBalances(addresses: string[], tokenContractAddress?: string[]): Promise<{}>;
    private getLoadBalancerApi;
    private getBlockExplorerApi;
}
