import {Subject} from 'rxjs';
import {NetworkInfo} from './types/network-info';
import {BlockExplorerApi, blockExplorerApi} from './api/block-explorer-api';
import {LoadBalancerApi, loadBalancerApi} from './api/load-balancer-api';
import {PeerNodeApi} from './api';

export class DagNetwork {

  private connectedNetwork: NetworkInfo = { id: 'main', beUrl: '', lbUrl: ''};

  private networkChange$ = new Subject<NetworkInfo>();

  loadBalancerApi = loadBalancerApi;
  blockExplorerApi = blockExplorerApi;

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

  validatorNode (host: string) {
    return new PeerNodeApi(host);
  }

  blockExplorer (host: string) {
    return new BlockExplorerApi(host);
  }

  loadBalancer (host: string) {
    return new LoadBalancerApi(host);
  }

  //Configure the network of the global instances: blockExplorerApi and loadBalancerApi
  setNetwork(netInfo: NetworkInfo) {
    if (this.connectedNetwork !== netInfo) {
      this.connectedNetwork = netInfo;

      blockExplorerApi.config().baseUrl(netInfo.beUrl);
      loadBalancerApi.config().baseUrl(netInfo.lbUrl);

      this.networkChange$.next(netInfo);
    }
  }

  getNetwork () {
    return this.connectedNetwork;
  }

}

export const dagNetwork = new DagNetwork();

