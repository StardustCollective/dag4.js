import { RestApi } from '@stardust-collective/dag4-core';
import { DNC } from '../../DNC';
import {
  ActionType,
  ActionResponse,
  AddressBalanceV2,
  AllowSpendResponse,
  BlockV2,
  CurrencySnapshotV2,
  RewardTransaction,
  SnapshotV2,
  TokenLockResponse,
  TransactionV2
} from '../../dto/v2';

type HashOrOrdinal = string | number;
export type Response<T> = { data: T }; 
export type ResponseWithMetadata<T> = Response<T> & { meta?: { next: string } };

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
  async getSnapshot(hash: HashOrOrdinal) {
    return this.service.$get<Response<SnapshotV2>>(`/global-snapshots/${hash}`);
  }

  async getTransactionsBySnapshot (hash: HashOrOrdinal, limit?: number, searchAfter?: string, searchBefore?: string, next?: string) {
    const params = this.buildRequestParams({ limit, searchAfter, searchBefore, next });
    
    return this.service.$get<ResponseWithMetadata<TransactionV2[]>>(`/global-snapshots/${hash}/transactions`, params);
  }

  async getRewardsBySnapshot(hash: HashOrOrdinal, limit?: number, next?: string) {
    const params = this.buildRequestParams({ limit, next });
    
    return this.service.$get<ResponseWithMetadata<RewardTransaction>>(`/global-snapshots/${hash}/rewards`, params);
  }

  async getSnapshots(limit?: number, searchAfter?: string, searchBefore?: string, next?: string) {    
    const params = this.buildRequestParams({ limit, searchAfter, searchBefore, next });
    
    return this.service.$get<ResponseWithMetadata<SnapshotV2[]>>(`/global-snapshots`, params);
  }

  async getLatestSnapshot () {
    return this.service.$get<Response<SnapshotV2>>('/global-snapshots/latest');
  }

  async getLatestSnapshotTransactions(limit?: number, searchAfter?: string, searchBefore?: string, next?: string) {
    const params = this.buildRequestParams({ limit, searchAfter, searchBefore, next });
    
    return this.service.$get<ResponseWithMetadata<TransactionV2[]>>(`/global-snapshots/latest/transactions`, params);
  }

  async getLatestSnapshotRewards(limit?: number, next?: string) {
    const params = this.buildRequestParams({ limit, next });
    
    return this.service.$get<ResponseWithMetadata<RewardTransaction>>(`/global-snapshots/latest/rewards`, params);
  }

   // Private method
   private buildRequestParams({
    limit = null, 
    searchAfter = null, 
    searchBefore = null,
    next = null,
    actionType = null,
    active = false
  } : {
    limit?: number, 
    searchAfter?: string, 
    searchBefore?: string,
    next?: string,
    actionType?: ActionType,
    active?: boolean
  }) {
    let params;

    if (limit || searchAfter || searchBefore || next || active) {
      params = {};

      if (limit && limit > 0) {
        params.limit = limit;
      }

      if (actionType) {
        params.transactionType = actionType;
      }

      if (active) {
        params.active = active;
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
    
    return this.service.$get<ResponseWithMetadata<TransactionV2[]>>(`/transactions`, params);
  }

  async getTransactionsByAddress(address: string, limit?: number, searchAfter?: string, sentOnly?: boolean, receivedOnly?: boolean, searchBefore?: string, next?: string) {
    const searchPath = sentOnly ? '/sent' : receivedOnly ? '/received' : ''; 
    const params = this.buildRequestParams({ limit, searchAfter, searchBefore, next });
    
    return this.service.$get<ResponseWithMetadata<TransactionV2[]>>(`/addresses/${address}/transactions${searchPath}`, params);
  }

  async getTransaction(hash: string) {
    return this.service.$get<Response<TransactionV2>>(`/transactions/${hash}`);
  }

  // Addresses
  async getAddressBalance(address: string) {
    return this.service.$get<Response<AddressBalanceV2>>(`/addresses/${address}/balance`);
  }

  // Blocks
  async getCheckpointBlock(hash: string) {
    return this.service.$get<Response<BlockV2>>(`/blocks/${hash}`);
  }

  // Metagraphs
  async getLatestCurrencySnapshot(metagraphId: string) {
    return this.service.$get<Response<CurrencySnapshotV2>>(`/currency/${metagraphId}/snapshots/latest`);
  }

  async getCurrencySnapshot(metagraphId: string, hashOrOrdinal: string) {
    return this.service.$get<Response<CurrencySnapshotV2>>(`/currency/${metagraphId}/snapshots/${hashOrOrdinal}`);
  }

  async getLatestCurrencySnapshotRewards(metagraphId: string, limit?: number, next?: string) {
    const params = this.buildRequestParams({ limit, next });
    
    return this.service.$get<ResponseWithMetadata<RewardTransaction>>(`/currency/${metagraphId}/snapshots/latest/rewards`, params);
  }

  async getCurrencySnapshotRewards(metagraphId: string, hashOrOrdinal: string, limit?: number, next?: string) {
    const params = this.buildRequestParams({ limit, next });
    
    return this.service.$get<ResponseWithMetadata<RewardTransaction>>(`/currency/${metagraphId}/snapshots/${hashOrOrdinal}/rewards`, params);
  }

  async getCurrencyBlock(metagraphId: string, hash: string) {
    return this.service.$get<Response<BlockV2>>(`/currency/${metagraphId}/blocks/${hash}`);
  }

  async getCurrencyAddressBalance(metagraphId: string, address: string) {
    return this.service.$get<Response<AddressBalanceV2>>(`/currency/${metagraphId}/addresses/${address}/balance`);
  }

  async getCurrencyTransaction(metagraphId: string, hash: string) {
    return this.service.$get<Response<TransactionV2>>(`/currency/${metagraphId}/transactions/${hash}`);
  }

  async getCurrencyTransactions(metagraphId: string, limit?: number, searchAfter?: string, searchBefore?: string, next?: string) {
    const params = this.buildRequestParams({ limit, searchAfter, searchBefore, next });
    
    return this.service.$get<ResponseWithMetadata<TransactionV2[]>>(`/currency/${metagraphId}/transactions`, params);
  }

  async getCurrencyTransactionsByAddress(metagraphId: string, address: string, limit?: number, searchAfter?: string, sentOnly?: boolean, receivedOnly?: boolean, searchBefore?: string, next?: string) {
    const searchPath = sentOnly ? '/sent' : receivedOnly ? '/received' : ''; 
    const params = this.buildRequestParams({ limit, searchAfter, searchBefore, next });
    
    return this.service.$get<ResponseWithMetadata<TransactionV2[]>>(`/currency/${metagraphId}/addresses/${address}/transactions${searchPath}`, params);
  }

  async getCurrencyActionsByAddress(metagraphId: string, address: string, actionType?: ActionType, limit?: number, searchAfter?: string, searchBefore?: string, next?: string) {
    const params = this.buildRequestParams({ limit, searchAfter, searchBefore, next, actionType });
    
    return this.service.$get<ResponseWithMetadata<ActionResponse[]>>(`/currency/${metagraphId}/addresses/${address}/actions`, params);
  }

  async getCurrencyTransactionsBySnapshot(metagraphId: string, hashOrOrdinal: string, limit?: number, searchAfter?: string, searchBefore?: string, next?: string) {
    const params = this.buildRequestParams({ limit, searchAfter, searchBefore, next });
    
    return this.service.$get<ResponseWithMetadata<TransactionV2[]>>(`/currency/${metagraphId}/snapshots/${hashOrOrdinal}/transactions`, params);
  }

  async getCurrencyTokenLocksByAddress(metagraphId: string, address: string, limit?: number, searchAfter?: string, searchBefore?: string, next?: string, active?: boolean) {
    const params = this.buildRequestParams({ limit, searchAfter, searchBefore, next, active });

    return this.service.$get<ResponseWithMetadata<TokenLockResponse[]>>(`/currency/${metagraphId}/addresses/${address}/token-locks`, params);
  }

  async getCurrencyAllowSpendsByAddress(metagraphId: string, address: string, limit?: number, searchAfter?: string, searchBefore?: string, next?: string, active?: boolean) {
    const params = this.buildRequestParams({ limit, searchAfter, searchBefore, next, active });

    return this.service.$get<ResponseWithMetadata<AllowSpendResponse[]>>(`/currency/${metagraphId}/addresses/${address}/allow-spends`, params);
  }

  async getActionsByAddress(address: string, actionType?: ActionType, limit?: number, searchAfter?: string, searchBefore?: string, next?: string) {
    const params = this.buildRequestParams({ limit, searchAfter, searchBefore, next, actionType });

    return this.service.$get<ResponseWithMetadata<ActionResponse[]>>(`/addresses/${address}/actions`, params);
  }

  async getTokenLocksByAddress(address: string, limit?: number, searchAfter?: string, searchBefore?: string, next?: string, active?: boolean) {
    const params = this.buildRequestParams({ limit, searchAfter, searchBefore, next, active });

    return this.service.$get<ResponseWithMetadata<TokenLockResponse[]>>(`/addresses/${address}/token-locks`, params);
  }

  async getAllowSpendsByAddress(address: string, limit?: number, searchAfter?: string, searchBefore?: string, next?: string, active?: boolean) {
    const params = this.buildRequestParams({ limit, searchAfter, searchBefore, next, active });
    
    return this.service.$get<ResponseWithMetadata<AllowSpendResponse[]>>(`/addresses/${address}/allow-spends`, params);
  }
}

export const blockExplorerApi = new BlockExplorerV2Api();


