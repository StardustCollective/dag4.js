import {Subject} from 'rxjs';
import {NetworkInfo} from './types/network-info';
import {LoadBalancerApi} from './api/v1/load-balancer-api';
import {BlockExplorerApi} from './api/v1/block-explorer-api';
import {L0Api} from './api/v2/l0-api';
import {L1Api} from './api/v2/l1-api';
import {BlockExplorerV2Api} from './api/v2/block-explorer-api';
import {PostTransactionV2} from './dto/v2';
import {PostTransaction} from './dto/v1';

export class DagNetwork {
  private connectedNetwork: NetworkInfo = { id: 'main', beUrl: '', lbUrl: '', l0Url: '', l1Url: ''};

  private networkChange$ = new Subject<NetworkInfo>();

  loadBalancerApi = new LoadBalancerApi();
  blockExplorerApi = new BlockExplorerApi();
  blockExplorerV2Api = new BlockExplorerV2Api();
  l0Api = new L0Api();
  l1Api = new L1Api();

  constructor(netInfo?: NetworkInfo) {
    if (netInfo) {
      this.setNetwork(netInfo);
    }
  }

  config(netInfo?: NetworkInfo) {
    if (netInfo) {
      this.setNetwork(netInfo);
    }
    else {
      return this.getNetwork();
    }
  }

  observeNetworkChange() {
    return this.networkChange$;
  }

  //Configure the network of the global instances: blockExplorerApi and loadBalancerApi
  setNetwork(netInfo: NetworkInfo) {
    if (this.connectedNetwork !== netInfo) {
      this.connectedNetwork = netInfo;

      if (netInfo.networkVersion === '2.0') {
        this.blockExplorerV2Api.config().baseUrl(netInfo.beUrl);
        this.l0Api.config().baseUrl(netInfo.l0Url);
        this.l1Api.config().baseUrl(netInfo.l1Url);
      } else { // v1
        this.blockExplorerApi.config().baseUrl(netInfo.beUrl);
        this.loadBalancerApi.config().baseUrl(netInfo.lbUrl);
      }

      this.networkChange$.next(netInfo);
    }
  }

  getNetwork () {
    return this.connectedNetwork;
  }

  getNetworkVersion() {
    return this.connectedNetwork.networkVersion;
  }

  async getAddressBalance(address: string) {
    if (this.getNetworkVersion() === '2.0') {
      return this.l0Api.getAddressBalance(address);
    }

    return this.loadBalancerApi.getAddressBalance(address);
  }

  async getAddressLastAcceptedTransactionRef(address: string) {
    if (this.getNetworkVersion() === '2.0') {
      return this.l1Api.getAddressLastAcceptedTransactionRef(address);
    }

    return this.loadBalancerApi.getAddressLastAcceptedTransactionRef(address);
  }

  async getPendingTransaction(hash: string | null) {
    if (this.getNetworkVersion() === '2.0') {
      let pendingTransaction = null;
      try {
        pendingTransaction = await this.l1Api.getPendingTransaction(hash);
      } catch (e: any) {
        // NOOP 404
      }
      return pendingTransaction;
    }

    return this.loadBalancerApi.getTransaction(hash);
  }

  async getTransaction(hash: string | null) {
    if (this.getNetworkVersion() === '2.0') {
      let transaction = null;
      try {
        transaction = await this.blockExplorerV2Api.getTransaction(hash);
      } catch (e: any) {
        // NOOP 404
      }
      return transaction;
    }

    return this.blockExplorerApi.getTransaction(hash);
  }

  async postTransaction(tx: PostTransaction | PostTransactionV2) {
    if (this.getNetworkVersion() === '2.0') {
      const response = this.l1Api.postTransaction(tx as PostTransactionV2) as any;

      // Allow for data: { hash: '' } format or string format response
      return response?.data?.hash ? response.data.hash : response;
    }

    return this.loadBalancerApi.postTransaction(tx as PostTransaction);
  }
}

