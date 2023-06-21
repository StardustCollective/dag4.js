import {RestApi} from '@stardust-collective/dag4-core';
import {DNC} from '../../DNC';
import {
  SnapshotV2, 
  TransactionV2, 
  GetTransactionResponseV2, 
  RewardTransaction, 
  AddressBalanceV2, 
  BlockV2,
  CurrencySnapshot
} from '../../dto/v2';

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

  _getTransactionSearchPathAndParams (basePath: string, limit, searchAfter, sentOnly, receivedOnly, searchBefore) {
    let params, path = basePath;

    if (limit || searchAfter || searchBefore) {
      params = {};

      if (limit > 0) {
        params.limit = limit;
      }

      if (searchAfter) {
        params.search_after = searchAfter;
      } else if (searchBefore) {
        params.search_before = searchBefore;
      }
    }

    if (sentOnly) {
      path += '/sent'
    }
    else if (receivedOnly) {
      path += '/received'
    }

    return {path, params};
  }

  async getTransactions (limit, searchAfter, searchBefore) {
    const basePath = `/transactions`;
    
    const {path, params} = this._getTransactionSearchPathAndParams(basePath, limit, searchAfter, false, false, searchBefore);

    return this.service.$get<TransactionV2[]>(path, params);
  }

  async getTransactionsByAddress (address: string, limit: number = 0, searchAfter = '', sentOnly = false, receivedOnly = false, searchBefore = '') {
    const basePath = `/addresses/${address}/transactions`;
    
    const {path, params} = this._getTransactionSearchPathAndParams(basePath, limit, searchAfter, sentOnly, receivedOnly, searchBefore);

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

  // Metagraphs
  async getLatestCurrencySnapshot(metagraphId: string) {
    return this.service.$get<CurrencySnapshot>(`/currency/${metagraphId}/snapshots/latest`);
  }

  async getCurrencySnapshot(metagraphId: string, hashOrOrdinal: string) {
    return this.service.$get<CurrencySnapshot>(`/currency/${metagraphId}/snapshots/${hashOrOrdinal}`);
  }

  async getLatestCurrencySnapshotRewards(metagraphId: string) {
    return this.service.$get<RewardTransaction>(`/currency/${metagraphId}/snapshots/latest/rewards`);
  }

  async getCurrencySnapshotRewards(metagraphId: string, hashOrOrdinal: string) {
    return this.service.$get<RewardTransaction>(`/currency/${metagraphId}/snapshots/${hashOrOrdinal}/rewards`);
  }

  async getCurrencyBlock(metagraphId: string, hash: string) {
    return this.service.$get<BlockV2>(`/currency/${metagraphId}/blocks/${hash}`);
  }

  async getCurrencyAddressBalance(metagraphId: string, hash: string) {
    return this.service.$get<AddressBalanceV2>(`/currency/${metagraphId}/addresses/${hash}/balance`);
  }

  async getCurrencyTransaction (metagraphId: string, hash: string) {
    return this.service.$get<GetTransactionResponseV2>(`/currency/${metagraphId}/transactions/${hash}`);
  }

  async getCurrencyTransactions (metagraphId: string, limit, searchAfter, searchBefore) {
    const basePath = `/currency/${metagraphId}/transactions`;
    
    const {path, params} = this._getTransactionSearchPathAndParams(basePath, limit, searchAfter, false, false, searchBefore);

    return this.service.$get<TransactionV2[]>(path, params);
  }

  async getCurrencyTransactionsByAddress (metagraphId: string, address: string, limit: number = 0, searchAfter = '', sentOnly = false, receivedOnly = false, searchBefore = '') {
    const basePath = `/currency/${metagraphId}/addresses/${address}/transactions`;
    
    const {path, params} = this._getTransactionSearchPathAndParams(basePath, limit, searchAfter, sentOnly, receivedOnly, searchBefore);

    return this.service.$get<TransactionV2[]>(path, params);
  }

  async getCurrencyTransactionsBySnapshot (metagraphId: string, hashOrOrdinal: string, limit: number = 0, searchAfter = '', searchBefore = '') {
    const basePath = `/currency/${metagraphId}/snapshots/${hashOrOrdinal}/transactions`;
    
    const {path, params} = this._getTransactionSearchPathAndParams(basePath, limit, searchAfter, false, false, searchBefore);

    return this.service.$get<TransactionV2[]>(path, params);
  }
}

export const blockExplorerApi = new BlockExplorerV2Api();


