import { IStateStorageClient } from './state-storage-db';
export declare class MemoryStorageClient implements IStateStorageClient {
    private memory;
    setItem(key: string, value: any): void;
    getItem(key: string): any;
    removeItem(key: string): void;
}
