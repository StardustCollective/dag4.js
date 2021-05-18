import {Subject} from 'rxjs';
import {NetworkInfo} from './types/network-info';
import {BlockExplorerApi} from './api/block-explorer-api';
import {LoadBalancerApi} from './api/load-balancer-api';

export class DagNetwork {

  private connectedNetwork: NetworkInfo = { id: 'main', beUrl: '', lbUrl: ''};

  private networkChange$ = new Subject<NetworkInfo>();

  loadBalancerApi = new LoadBalancerApi();
  blockExplorerApi = new BlockExplorerApi();

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

      this.blockExplorerApi.config().baseUrl(netInfo.beUrl);
      this.loadBalancerApi.config().baseUrl(netInfo.lbUrl);

      this.networkChange$.next(netInfo);
    }
  }

  getNetwork () {
    return this.connectedNetwork;
  }

}

