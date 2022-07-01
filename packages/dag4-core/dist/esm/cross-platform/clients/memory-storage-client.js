export class MemoryStorageClient {
    constructor() {
        this.memory = {};
    }
    setItem(key, value) {
        this.memory[key] = value;
    }
    getItem(key) {
        return this.memory[key];
    }
    removeItem(key) {
        this.memory[key] = null;
    }
}
//# sourceMappingURL=memory-storage-client.js.map