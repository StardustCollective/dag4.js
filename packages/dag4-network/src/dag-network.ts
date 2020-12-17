import {Subject} from 'rxjs';
import {NetworkInfo} from './types/network-info';
import {blockExplorerApi} from './api/block-explorer-api';
import {loadBalancerApi} from './api/load-balancer-api';

export class DagNetwork {

  private connectedNetwork: NetworkInfo;

  private networkChange$ = new Subject<NetworkInfo>();

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

