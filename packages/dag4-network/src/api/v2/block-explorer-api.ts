import {RestApi} from '@stardust-collective/dag4-core';
import {DNC} from '../../DNC';
import {SnapshotV2, TransactionV2, GetTransactionResponseV2, RewardTransaction, AddressBalanceV2, BlockV2} from '../../dto/v2';

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
    return this.service.$get<SnapshotV2>(`/global-snapshots/${id}`);
  }

  async getTransactionsBySnapshot (id: HashOrOrdinal) {
    return this.service.$get<TransactionV2[]>(`/global-snapshots/${id}/transactions`);
  }

  async getRewardsBySnapshot(id: HashOrOrdinal) {
    return this.service.$get<RewardTransaction>(`/global-snapshots/${id}/rewards`);
  }

  async getLatestSnapshot () {
    return this.service.$get<SnapshotV2>('/global-snapshots/latest');
  }

  async getLatestSnapshotTransactions() {
    return this.service.$get<TransactionV2>('/global-snapshots/latest/transactions');
  }

  async getLatestSnapshotRewards() {
    return this.service.$get<RewardTransaction>('/global-snapshots/latest/rewards');
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
    let params, path = `/addresses/${address}/transactions`;

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
    return this.service.$get<GetTransactionResponseV2>(`/transactions/${hash}`);
  }

  // Addresses
  async getAddressBalance(hash: string) {
    return this.service.$get<AddressBalanceV2>(`/addresses/${hash}/balance`);
  }

  // Blocks
  async getCheckpointBlock(hash: string) {
    return this.service.$get<BlockV2>(`/blocks/${hash}`);
  }
}

export const blockExplorerApi = new BlockExplorerV2Api();


