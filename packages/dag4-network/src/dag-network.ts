import {Subject} from 'rxjs';
import {NetworkInfo} from './types/network-info';
import {LoadBalancerApi} from './api/v1/load-balancer-api';
import {BlockExplorerApi} from './api/v1/block-explorer-api';
import {L0Api} from './api/v2/l0-api';
import {L1Api} from './api/v2/l1-api';
import {BlockExplorerV2Api} from './api/v2/block-explorer-api';

export class DagNetwork {

  private connectedNetwork: NetworkInfo = { id: 'main', beUrl: '', lbUrl: ''};

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
        console.log('v2.0');
        this.blockExplorerV2Api.config().baseUrl(netInfo.beUrl);
        this.l0Api.config().baseUrl(netInfo.l0Url);
        this.l1Api.config().baseUrl(netInfo.l1Url);
      } else { // v1
        console.log('v1');
        this.blockExplorerApi.config().baseUrl(netInfo.beUrl);
        this.loadBalancerApi.config().baseUrl(netInfo.lbUrl);
      }

      this.networkChange$.next(netInfo);
    }
  }

  getNetwork () {
    return this.connectedNetwork;
  }

}

