"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryStorageClient = void 0;
class MemoryStorageClient {
    memory = {};
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
exports.MemoryStorageClient = MemoryStorageClient;
//# sourceMappingURL=memory-storage-client.js.map