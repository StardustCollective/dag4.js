"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadBalancerApi = exports.LoadBalancerApi = void 0;
const dag4_core_1 = require("@stardust-collective/dag4-core");
const DNC_1 = require("../../DNC");
const peer_metrics_1 = require("../../dto/v1/peer-metrics");
class LoadBalancerApi {
    service = new dag4_core_1.RestApi(DNC_1.DNC.LOAD_BALANCER_URL);
    constructor(host) {
        if (host) {
            this.config().baseUrl(host);
        }
    }
    config() {
        return this.service.configure();
    }
    async getMetrics() {
        return this.service.$get('/metrics').then(rawData => peer_metrics_1.PeerMetrics.parse(rawData.metrics, 0));
    }
    async getAddressBalance(address) {
        return this.service.$get('/address/' + address);
    }
    async getAddressLastAcceptedTransactionRef(address) {
        return this.service.$get('/transaction/last-ref/' + address);
    }
    async getTotalSupply() {
        return this.service.$get('/total-supply');
    }
    async postTransaction(tx) {
        return this.service.$post('/transaction', tx);
    }
    async getTransaction(hash) {
        return this.service.$get('/transaction/' + hash);
    }
    async checkTransactionStatus(hash) {
        const tx = await this.service.$get('/transaction/' + hash);
        if (tx) {
            if (tx.cbBaseHash) {
                return { accepted: true, inMemPool: false };
            }
            return { accepted: false, inMemPool: true };
        }
        return null;
    }
    async getClusterInfo() {
        return this.service.$get('/cluster/info').then(info => this.processClusterInfo(info));
    }
    async getClusterInfoWithRetry() {
        return this.service.$get('/cluster/info', null, { retry: 5 }).then(info => this.retryClusterInfo(info));
    }
    //Returns number of connected Nodes in Cluster
    async activeNodeCount() {
        return this.service.$get('/utils/health');
    }
    retryClusterInfo(info) {
        if (info && info.map) {
            return this.processClusterInfo(info);
        }
        else {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve(this.getClusterInfoWithRetry());
                }, 1000);
            });
        }
    }
    processClusterInfo(info) {
        return info && info.map && info.map(d => ({ alias: d.alias, walletId: d.id.hex, ip: d.ip.host, status: d.status, reputation: d.reputation }));
    }
}
exports.LoadBalancerApi = LoadBalancerApi;
exports.loadBalancerApi = new LoadBalancerApi();
//# sourceMappingURL=load-balancer-api.js.map