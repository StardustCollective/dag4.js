import { RestApi } from '@stardust-collective/dag4-core';
import { DNC } from '../../DNC';
export class BlockExplorerV2Api {
    constructor(host) {
        this.service = new RestApi(DNC.BLOCK_EXPLORER_URL);
        if (host) {
            this.config().baseUrl(host);
        }
    }
    config() {
        return this.service.configure();
    }
    // Snapshots
    async getSnapshot(id) {
        return this.service.$get(`/global-snapshots/${id}`);
    }
    async getTransactionsBySnapshot(id) {
        return this.service.$get(`/global-snapshots/${id}/transaction`);
    }
    async getRewardsBySnapshot(id) {
        return this.service.$get(`/global-snapshots/${id}/rewards`);
    }
    async getLatestSnapshot() {
        return this.service.$get('/global-snapshots/latest');
    }
    async getLatestSnapshotTransactions() {
        return this.service.$get('/global-snapshots/latest/transaction');
    }
    async getLatestSnapshotRewards() {
        return this.service.$get('/global-snapshots/latest/rewards');
    }
    // Transactions
    _formatDate(date, paramName) {
        try {
            return new Date(date).toISOString();
        }
        catch (e) {
            throw new Error(`ParamError: "${paramName}" is not valid ISO 8601`);
        }
    }
    async getTransactionsByAddress(address, limit = 0, searchAfter = '', sentOnly = false, receivedOnly = false, searchBefore = '') {
        let params, path = `/addresses/${address}/transactions`;
        if (limit || searchAfter) {
            params = {};
            if (limit > 0) {
                params.limit = limit;
            }
            if (searchAfter) {
                params.search_after = this._formatDate(searchAfter, 'searchAfter');
            }
            else if (searchBefore) {
                params.search_before = this._formatDate(searchBefore, 'searchBefore');
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
    async getTransaction(hash) {
        return this.service.$get(`/transactions/${hash}`);
    }
    // Addresses
    async getAddressBalance(hash) {
        return this.service.$get(`/addresses/${hash}/balance`);
    }
    // Blocks
    async getCheckpointBlock(hash) {
        return this.service.$get(`/blocks/${hash}`);
    }
}
export const blockExplorerApi = new BlockExplorerV2Api();
//# sourceMappingURL=block-explorer-api.js.map