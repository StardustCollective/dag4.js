"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateStorageDb = void 0;
const defaultStorage = typeof window !== 'undefined' ? window.localStorage : undefined;
class StateStorageDb {
    storageClient;
    keyPrefix = 'dag4-';
    constructor(storageClient = defaultStorage) {
        this.storageClient = storageClient;
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
exports.StateStorageDb = StateStorageDb;
//# sourceMappingURL=state-storage-db.js.map