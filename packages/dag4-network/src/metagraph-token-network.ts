import { MetagraphTokenDataL1Api } from "./api/metagraph-token/data-l1-api";
import { MetagraphTokenL0Api } from "./api/metagraph-token/l0-api";
import { MetagraphTokenL1Api } from "./api/metagraph-token/l1-api";
import { BlockExplorerV2Api } from './api/v2/block-explorer-api';
import {
  ActionType,
  ActionResponse,
  CurrencySnapshotV2,
  PendingTransaction,
  PostTransactionV2,
  TransactionV2,
  AllowSpendResponse,
  TokenLockResponse
} from "./dto/v2";
import { MetagraphNetworkInfo } from "./types/network-info";

class MetagraphTokenNetwork {
  private connectedNetwork: MetagraphNetworkInfo;

  l0Api: MetagraphTokenL0Api;
  l1Api: MetagraphTokenL1Api;
  dl1Api: MetagraphTokenDataL1Api | null;
  beApi: BlockExplorerV2Api;

  constructor(netInfo: MetagraphNetworkInfo) {
    this.connectedNetwork = netInfo;
    this.l0Api = new MetagraphTokenL0Api(netInfo.l0Url);
    this.l1Api = new MetagraphTokenL1Api(netInfo.l1Url);
    this.dl1Api = netInfo.dl1Url ? new MetagraphTokenDataL1Api(netInfo.dl1Url) : null;
    this.beApi = new BlockExplorerV2Api(netInfo.beUrl);
  }

  getNetwork() {
    return this.connectedNetwork;
  }

  async getAddressBalance(address: string) {
    return this.l0Api.getAddressBalance(address);
  }

  async getAddressLastAcceptedTransactionRef(address: string) {
    return this.l1Api.getAddressLastAcceptedTransactionRef(address);
  }

  async getPendingTransaction(
    hash: string | null
  ): Promise<null | PendingTransaction> {
    let pendingTransaction = null;
    try {
      pendingTransaction = await this.l1Api.getPendingTransaction(hash);
    } catch (e: any) {
      // NOOP 404
    }
    return pendingTransaction;
  }

  async getTransactionsByAddress(
    address: string,
    limit?: number,
    searchAfter?: string
  ): Promise<TransactionV2[]> {
    let response = null;
    try {
      response = await this.beApi.getCurrencyTransactionsByAddress(
        this.connectedNetwork.metagraphId,
        address,
        limit,
        searchAfter
      );
    } catch (e: any) {
      // NOOP 404
    }
    return response ? response.data : null;
  }

  async getActionsByAddress(
    address: string,
    actionType?: ActionType,
    limit?: number,
    searchAfter?: string,
    searchBefore?: string,
    next?: string
  ): Promise<ActionResponse[]> {
    const actions = await this.beApi.getCurrencyActionsByAddress(this.connectedNetwork.metagraphId, address, actionType, limit, searchAfter, searchBefore, next);

    if (!actions?.data?.length) return [];

    return actions.data;
  }

  async getActiveTokenLocksTransactions(address: string, limit?: number, searchAfter?: string, searchBefore?: string): Promise<TokenLockResponse[]> {
    const activeTokenLocks: TokenLockResponse[] = [];
    let next: string | undefined;
    
    do {
      const response = await this.beApi.getCurrencyTokenLocksByAddress(
        this.connectedNetwork.metagraphId,
        address,
        limit,
        searchAfter,
        searchBefore,
        next,
        true,
      );
      
      if (response?.data) {
        activeTokenLocks.push(...response.data);
      }
      
      next = response?.meta?.next;
    } while (next);
    
    return activeTokenLocks;
  };

  async getActiveAllowSpendsTransactions(address: string, limit?: number, searchAfter?: string, searchBefore?: string): Promise<AllowSpendResponse[]> {
    const activeAllowSpends: AllowSpendResponse[] = [];
    let next: string | undefined;
    
    do {
      const response = await this.beApi.getCurrencyAllowSpendsByAddress(
        this.connectedNetwork.metagraphId,
        address,
        limit,
        searchAfter,
        searchBefore,
        next,
        true,
      );
      
      if (response?.data) {
        activeAllowSpends.push(...response.data);
      }
      
      next = response?.meta?.next;
    } while (next);
    
    return activeAllowSpends;
  };

  async getTransaction(
    hash: string | null
  ): Promise<null | TransactionV2> {
    let response = null;
    try {
      response = await this.beApi.getCurrencyTransaction(this.connectedNetwork.metagraphId, hash);
    } catch (e: any) {
      // NOOP 404
    }
    return response ? response.data : null;
  }

  async postTransaction(tx: PostTransactionV2, params?: Record<string, any>): Promise<string> {
    const response = (await this.l1Api.postTransaction(
      tx as PostTransactionV2,
      params
    )) as any;

    // Support data/meta format and object return format
    return response.data ? response.data.hash : response.hash;
  }

  async getLatestSnapshot(): Promise<CurrencySnapshotV2> {
    const response = (await this.beApi.getLatestCurrencySnapshot(this.connectedNetwork.metagraphId)) as any;

    return response.data;
  }

  async getDataFeeEstimate(data: any) {
    if (!this.dl1Api) {
      throw new Error("Data layer is required to estimate data fee");
    }

    if (!data) {
      throw new Error("Data is required to estimate data fee");
    }

    return this.dl1Api.getDataFeeEstimate(data);
  }

  async postDataTransaction(data: any) {
    if (!this.dl1Api) {
      throw new Error("Data layer is required to post data transaction");
    }

    if (!data) {
      throw new Error("Data is required to post data transaction");
    }

    return this.dl1Api.postDataTransaction(data);
  }
}

export { MetagraphTokenNetwork };
