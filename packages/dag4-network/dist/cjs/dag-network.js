"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DagNetwork = void 0;
const rxjs_1 = require("rxjs");
const load_balancer_api_1 = require("./api/v1/load-balancer-api");
const block_explorer_api_1 = require("./api/v1/block-explorer-api");
const l0_api_1 = require("./api/v2/l0-api");
const l1_api_1 = require("./api/v2/l1-api");
const block_explorer_api_2 = require("./api/v2/block-explorer-api");
class DagNetwork {
    connectedNetwork = { id: 'main', beUrl: '', lbUrl: '', l0Url: '', l1Url: '' };
    networkChange$ = new rxjs_1.Subject();
    loadBalancerApi = new load_balancer_api_1.LoadBalancerApi();
    blockExplorerApi = new block_explorer_api_1.BlockExplorerApi();
    blockExplorerV2Api = new block_explorer_api_2.BlockExplorerV2Api();
    l0Api = new l0_api_1.L0Api();
    l1Api = new l1_api_1.L1Api();
    constructor(netInfo) {
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
exports.DagNetwork = DagNetwork;
//# sourceMappingURL=dag-network.js.map