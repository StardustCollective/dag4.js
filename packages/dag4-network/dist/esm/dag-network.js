import { Subject } from 'rxjs';
import { LoadBalancerApi } from './api/v1/load-balancer-api';
import { BlockExplorerApi } from './api/v1/block-explorer-api';
import { L0Api } from './api/v2/l0-api';
import { L1Api } from './api/v2/l1-api';
import { BlockExplorerV2Api } from './api/v2/block-explorer-api';
export class DagNetwork {
    constructor(netInfo) {
        this.connectedNetwork = { id: 'main', beUrl: '', lbUrl: '', l0Url: '', l1Url: '' };
        this.networkChange$ = new Subject();
        this.loadBalancerApi = new LoadBalancerApi();
        this.blockExplorerApi = new BlockExplorerApi();
        this.blockExplorerV2Api = new BlockExplorerV2Api();
        this.l0Api = new L0Api();
        this.l1Api = new L1Api();
        if (netInfo) {
            this.setNetwork(netInfo);
        }
    }
    config(netInfo) {
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
    setNetwork(netInfo) {
        if (this.connectedNetwork !== netInfo) {
            this.connectedNetwork = netInfo;
            if (netInfo.networkVersion === '2.0') {
                console.log('v2.0');
                this.blockExplorerV2Api.config().baseUrl(netInfo.beUrl);
                this.l0Api.config().baseUrl(netInfo.l0Url);
                this.l1Api.config().baseUrl(netInfo.l1Url);
            }
            else { // v1
                console.log('v1');
                this.blockExplorerApi.config().baseUrl(netInfo.beUrl);
                this.loadBalancerApi.config().baseUrl(netInfo.lbUrl);
            }
            this.networkChange$.next(netInfo);
        }
    }
    getNetwork() {
        return this.connectedNetwork;
    }
    getNetworkVersion() {
        return this.connectedNetwork.networkVersion;
    }
    async getAddressBalance(address) {
        if (this.getNetworkVersion() === '2.0') {
            return this.l0Api.getAddressBalance(address);
        }
        return this.loadBalancerApi.getAddressBalance(address);
    }
    async getAddressLastAcceptedTransactionRef(address) {
        if (this.getNetworkVersion() === '2.0') {
            return this.l1Api.getAddressLastAcceptedTransactionRef(address);
        }
        return this.loadBalancerApi.getAddressLastAcceptedTransactionRef(address);
    }
    async getPendingTransaction(hash) {
        if (this.getNetworkVersion() === '2.0') {
            return null; // TODO: currently no way to get a pending txn
        }
        return this.loadBalancerApi.getTransaction(hash);
    }
    async postTransaction(tx) {
        if (this.getNetworkVersion() === '2.0') {
            console.log('sending v2.0');
            try {
                return this.l1Api.postTransaction(tx);
            }
            catch (err) {
                console.log('Caught postTransaction err: ', err);
                console.log(err.stack);
            }
        }
        return this.loadBalancerApi.postTransaction(tx);
    }
}
//# sourceMappingURL=dag-network.js.map