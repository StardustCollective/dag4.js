export declare class StateStorageDb {
    private storageClient;
    private keyPrefix;
    constructor(storageClient?: IStateStorageClient);
    setClient(client: IStateStorageClient): void;
    setPrefix(prefix: string): void;
    set(key: string, value: any): void;
    get(key: string): any;
    delete(key: string): void;
}
export interface IStateStorageClient {
    getItem(key: string): string | null;
    removeItem(key: string): void;
    setItem(key: string, value: string): void;
}
