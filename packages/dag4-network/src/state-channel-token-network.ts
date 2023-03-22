import { StateChannelNetworkInfo } from "./types/network-info";
import {
  PostTransactionV2,
  PendingTransaction,
  TransactionV2,
  SnapshotV2,
} from "./dto/v2";
import { StateChannelTokenL0Api } from "./api/state-channel-token/l0-api";
import { StateChannelTokenL1Api } from "./api/state-channel-token/l1-api";

class MethodNotAvailableError extends Error {
  constructor(ctor: { new (...args: any[]): any }, method: Function) {
    super(`${ctor.name}.${method.name} is not available`);
  }
}

class StateChannelTokenNetwork {
  private connectedNetwork: StateChannelNetworkInfo;

  l0Api: StateChannelTokenL0Api;
  l1Api: StateChannelTokenL1Api;

  constructor(netInfo: StateChannelNetworkInfo) {
    this.connectedNetwork = netInfo;
    this.l0Api = new StateChannelTokenL0Api(netInfo.l0Url);
    this.l1Api = new StateChannelTokenL1Api(netInfo.l1Url);
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
    throw new MethodNotAvailableError(
      StateChannelTokenNetwork,
      this.getTransactionsByAddress
    );
    /* let response = null;
    try {
      response = await this.blockExplorerV2Api.getTransactionsByAddress(
        address,
        limit,
        searchAfter
      );
    } catch (e: any) {
      // NOOP 404
    }
    return response ? response.data : null; */
  }

  async getTransaction(
    hash: string | null
  ): Promise<null | TransactionV2> {
    throw new MethodNotAvailableError(
      StateChannelTokenNetwork,
      this.getTransaction
    );
    /* let response = null;
    try {
      response = await this.blockExplorerV2Api.getTransaction(hash);
    } catch (e: any) {
      // NOOP 404
    }
    return response ? response.data : null; */
  }

  async postTransaction(tx: PostTransactionV2): Promise<string> {
    const response = (await this.l1Api.postTransaction(
      tx as PostTransactionV2
    )) as any;

    // Support data/meta format and object return format
    return response.data ? response.data.hash : response.hash;
  }

  async getLatestSnapshot(): Promise<SnapshotV2> {
    throw new MethodNotAvailableError(
      StateChannelTokenNetwork,
      this.getLatestSnapshot
    );
    /* const response = (await this.blockExplorerV2Api.getLatestSnapshot()) as any;

    return response.data; */
  }
}

export { StateChannelTokenNetwork };