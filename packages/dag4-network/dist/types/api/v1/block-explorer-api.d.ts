import { Block, Snapshot, Transaction } from '../../dto/v1';
declare type HashOrHeight = string | number;
export declare class BlockExplorerApi {
    private service;
    constructor(host?: string);
    config(): import("@stardust-collective/dag4-core").RestConfig;
    getLatestSnapshot(): Promise<Snapshot>;
    getSnapshot(id: HashOrHeight): Promise<Snapshot>;
    getTransactionsBySnapshot(id: HashOrHeight): Promise<Transaction[]>;
    getTransactionsByAddress(address: string, limit?: number, searchAfter?: string, sentOnly?: boolean, receivedOnly?: boolean): Promise<Transaction[]>;
    getCheckpointBlock(hash: string): Promise<Block>;
    getTransaction(hash: string): Promise<Transaction>;
}
export declare const blockExplorerApi: BlockExplorerApi;
export {};
