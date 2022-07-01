"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.blockExplorerApi = exports.BlockExplorerApi = void 0;
const dag4_core_1 = require("@stardust-collective/dag4-core");
const DNC_1 = require("../../DNC");
class BlockExplorerApi {
    service = new dag4_core_1.RestApi(DNC_1.DNC.BLOCK_EXPLORER_URL);
    constructor(host) {
        if (host) {
            this.config().baseUrl(host);
        }
    }
    config() {
        return this.service.configure();
    }
    async getLatestSnapshot() {
        return this.service.$get('/snapshot/latest');
    }
    async getSnapshot(id) {
        return this.service.$get('/snapshot/' + id);
    }
    async getTransactionsBySnapshot(id) {
        return this.service.$get('/snapshot/' + id + '/transaction');
    }
    async getTransactionsByAddress(address, limit = 0, searchAfter = '', sentOnly = false, receivedOnly = false) {
        let params, path = '/address/' + address + '/transaction';
        if (limit || searchAfter) {
            params = {};
            if (limit > 0) {
                params.limit = limit;
            }
            if (searchAfter) {
                try {
                    new Date(searchAfter).toISOString();
                }
                catch (e) {
                    throw new Error('ParamError: "searchAfter" is not valid ISO 8601');
                }
                params.search_after = searchAfter;
            }
        }
        if (sentOnly) {
            path += '/sent';
        }
        else if (receivedOnly) {
            path += '/received';
        }
        return this.service.$get(path, params);
    }
    async getCheckpointBlock(hash) {
        return this.service.$get('/checkpoint-block/' + hash);
    }
    async getTransaction(hash) {
        return this.service.$get('/transaction/' + hash);
    }
}
exports.BlockExplorerApi = BlockExplorerApi;
exports.blockExplorerApi = new BlockExplorerApi();
//# sourceMappingURL=block-explorer-api.js.map