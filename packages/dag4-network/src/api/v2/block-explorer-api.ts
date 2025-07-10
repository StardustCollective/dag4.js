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
  async getSnapshot(id: HashOrOrdinal) {
    return this.service.$get<SnapshotV2>(`/global-snapshots/${id}`);
  }


  async getTransactionsBySnapshot (id: HashOrOrdinal, limit?: number, searchAfter?: string, searchBefore?: string, next?: string) {
    const params = this.buildRequestParams({ limit, searchAfter, searchBefore, next });
    
    return this.service.$get<TransactionV2[]>(`/global-snapshots/${id}/transactions`, params);
  }

  async getRewardsBySnapshot(id: HashOrOrdinal, limit?: number, next?: string) {
    const params = this.buildRequestParams({ limit, next });
    
    return this.service.$get<RewardTransaction>(`/global-snapshots/${id}/rewards`, params);
  }

  async getSnapshots(limit?: number, searchAfter?: string, searchBefore?: string, next?: string) {    
    const params = this.buildRequestParams({ limit, searchAfter, searchBefore, next });
    
    return this.service.$get<SnapshotV2[]>('/global-snapshots', params);
  }

  async getLatestSnapshot () {
    return this.service.$get<SnapshotV2>('/global-snapshots/latest');
  }

  async getLatestSnapshotTransactions(limit?: number, searchAfter?: string, searchBefore?: string, next?: string) {
    const params = this.buildRequestParams({ limit, searchAfter, searchBefore, next });
    
    return this.service.$get<TransactionV2[]>(`/global-snapshots/latest/transactions`, params);
  }

  async getLatestSnapshotRewards(limit?: number, next?: string) {
    const params = this.buildRequestParams({ limit, next });
    
    return this.service.$get<RewardTransaction>(`/global-snapshots/latest/rewards`, params);
  }

   // Private method
   private buildRequestParams({
    limit = null, 
    searchAfter = null, 
    searchBefore = null,
    next = null
  } : {
    limit?: number, 
    searchAfter?: string, 
    searchBefore?: string,
    next?: string
  }) {
    let params;

    if (limit || searchAfter || searchBefore || next) {
      params = {};

      if (limit && limit > 0) {
        params.limit = limit;
      }

      // search_after, search_before and next are mutually exclusive
      if (searchAfter) {
        params.search_after = searchAfter;
      } else if (searchBefore) {
        params.search_before = searchBefore;
      } else if (next) {
        params.next = next;
      }
    }

    return params;
  }

  // Transactions
  async getTransactions(limit?: number, searchAfter?: string, searchBefore?: string, next?: string) {
    const params = this.buildRequestParams({ limit, searchAfter, searchBefore, next });
    
    return this.service.$get<TransactionV2[]>(`/transactions`, params);
  }

  async getTransactionsByAddress(address: string, limit?: number, searchAfter?: string, sentOnly?: boolean, receivedOnly?: boolean, searchBefore?: string, next?: string) {
    const searchPath = sentOnly ? '/sent' : receivedOnly ? '/received' : ''; 
    const params = this.buildRequestParams({ limit, searchAfter, searchBefore, next });
    
    return this.service.$get<TransactionV2[]>(`/addresses/${address}/transactions${searchPath}`, params);
  }

  async getTransaction(hash: string) {
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

  async getLatestCurrencySnapshotRewards(metagraphId: string, limit?: number, next?: string) {
    const params = this.buildRequestParams({ limit, next });
    
    return this.service.$get<RewardTransaction>(`/currency/${metagraphId}/snapshots/latest/rewards`, params);
  }

  async getCurrencySnapshotRewards(metagraphId: string, hashOrOrdinal: string, limit?: number, next?: string) {
    const params = this.buildRequestParams({ limit, next });
    
    return this.service.$get<RewardTransaction>(`/currency/${metagraphId}/snapshots/${hashOrOrdinal}/rewards`, params);
  }

  async getCurrencyBlock(metagraphId: string, hash: string) {
    return this.service.$get<BlockV2>(`/currency/${metagraphId}/blocks/${hash}`);
  }

  async getCurrencyAddressBalance(metagraphId: string, hash: string) {
    return this.service.$get<AddressBalanceV2>(`/currency/${metagraphId}/addresses/${hash}/balance`);
  }

  async getCurrencyTransaction(metagraphId: string, hash: string) {
    return this.service.$get<GetTransactionResponseV2>(`/currency/${metagraphId}/transactions/${hash}`);
  }

  async getCurrencyTransactions(metagraphId: string, limit?: number, searchAfter?: string, searchBefore?: string, next?: string) {
    const params = this.buildRequestParams({ limit, searchAfter, searchBefore, next });
    
    return this.service.$get<TransactionV2[]>(`/currency/${metagraphId}/transactions`, params);
  }

  async getCurrencyTransactionsByAddress(metagraphId: string, address: string, limit?: number, searchAfter?: string, sentOnly?: boolean, receivedOnly?: boolean, searchBefore?: string, next?: string) {
    const searchPath = sentOnly ? '/sent' : receivedOnly ? '/received' : ''; 
    const params = this.buildRequestParams({ limit, searchAfter, searchBefore, next });
    
    return this.service.$get<TransactionV2[]>(`/currency/${metagraphId}/addresses/${address}/transactions${searchPath}`, params);
  }

  async getCurrencyTransactionsBySnapshot(metagraphId: string, hashOrOrdinal: string, limit?: number, searchAfter?: string, searchBefore?: string, next?: string) {
    const params = this.buildRequestParams({ limit, searchAfter, searchBefore, next });
    
    return this.service.$get<TransactionV2[]>(`/currency/${metagraphId}/snapshots/${hashOrOrdinal}/transactions`, params);
  }
}

export const blockExplorerApi = new BlockExplorerV2Api();


