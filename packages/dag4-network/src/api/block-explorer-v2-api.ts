import {RestApi} from '@stardust-collective/dag4-core';
import {DNC} from '../DNC';
import {SnapshotV2, TransactionV2, RewardTransaction, AddressBalance, BlockV2} from '../dto/v2';

type HashOrOrdinal = string | number;

export class BlockExplorerV2Api {
  private service = new RestApi(DNC.BLOCK_EXPLORER_URL);

  constructor (host?: string) {
    if (host) {
      this.config().baseUrl(host);
    }
  }

  config () {
    return this.service.configure();
  }

  // Snapshots
  async getSnapshot (id: HashOrOrdinal) {
    return this.service.$get<SnapshotV2>(`/global-snapshot/${id}`);
  }

  async getTransactionsBySnapshot (id: HashOrOrdinal) {
    return this.service.$get<TransactionV2[]>(`/global-snapshot/${id}/transaction`);
  }

  async getRewardsBySnapshot(id: HashOrOrdinal) {
    return this.service.$get<RewardTransaction>(`/global-snapshot/${id}/rewards`);
  }

  async getLatestSnapshot () {
    return this.service.$get<SnapshotV2>('/global-snapshot/latest');
  }

  async getLatestSnapshotTransactions() {
    return this.service.$get<TransactionV2>('/global-snapshot/latest/transaction');
  }

  async getLatestSnapshotRewards() {
    return this.service.$get<RewardTransaction>('/global-snapshot/latest/rewards');
  }

  // Transactions
  _formatDate(date: string, paramName: string) {
    try {
      return new Date(date).toISOString();
    } catch(e) {
      throw new Error(`ParamError: "${paramName}" is not valid ISO 8601`);
    }
  }

  async getTransactionsByAddress (address: string, limit: number = 0, searchAfter = '', sentOnly = false, receivedOnly = false, searchBefore = '') {
    let params, path = `/address/${address}/transaction`;

    if (limit || searchAfter) {
      params = {};

      if (limit > 0) {
        params.limit = limit;
      }

      if (searchAfter) {
        params.search_after = this._formatDate(searchAfter, 'searchAfter');
      } else if (searchBefore) {
        params.search_before = this._formatDate(searchBefore, 'searchBefore');
      }
    }

    if (sentOnly) {
      path += '/sent'
    }
    else if (receivedOnly) {
      path += '/received'
    }

    return this.service.$get<TransactionV2[]>(path, params);
  }

  async getTransaction (hash: string) {
    return this.service.$get<TransactionV2>(`/transaction/${hash}`);
  }

  // Addresses
  async getAddressBalance(hash: string) {
    return this.service.$get<AddressBalance>(`/address/${hash}/balance`);
  }

  // Blocks
  async getCheckpointBlock(hash: string) {
    return this.service.$get<BlockV2>(`/block/${hash}`);
  }
}

export const blockExplorerApi = new BlockExplorerV2Api();


