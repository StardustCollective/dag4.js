const defaultStorage = typeof window !== 'undefined' ? window.localStorage : undefined;
export class StateStorageDb {
    constructor(storageClient = defaultStorage) {
        this.storageClient = storageClient;
        this.keyPrefix = 'dag4-';
    }
    setClient(client) {
        this.storageClient = client || defaultStorage;
    }
    setPrefix(prefix) {
        if (!prefix) {
            prefix = 'dag4-';
        }
        else if (prefix.charAt(prefix.length - 1) !== '-') {
            prefix += '-';
        }
        this.keyPrefix = prefix;
    }
    set(key, value) {
        this.storageClient.setItem(this.keyPrefix + key, JSON.stringify(value));
    }
    get(key) {
        const value = this.storageClient.getItem(this.keyPrefix + key);
        if (value) {
            return JSON.parse(value);
        }
    }
    delete(key) {
        this.storageClient.removeItem(this.keyPrefix + key);
    }
}
//# sourceMappingURL=state-storage-db.js.map