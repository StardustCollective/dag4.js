import { RestApi } from '@stardust-collective/dag4-core';
import { DNC } from '../../DNC';
export class L0Api {
    constructor(host) {
        this.service = new RestApi(DNC.L0_URL);
        if (host) {
            this.config().baseUrl(host);
        }
    }
    config() {
        return this.service.configure();
    }
    // Cluster Info
    async getClusterInfo() {
        return this.service.$get('/cluster/info').then(info => this.processClusterInfo(info));
    }
    async getClusterInfoWithRetry() {
        return this.service.$get('/cluster/info', null, { retry: 5 }).then(info => this.retryClusterInfo(info));
    }
    retryClusterInfo(info) {
        if (info && info.map) {
            return this.processClusterInfo(info);
        }
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(this.getClusterInfoWithRetry());
            }, 1000);
        });
    }
    processClusterInfo(info) {
        return info && info.map && info.map(d => ({ alias: d.alias, walletId: d.id.hex, ip: d.ip.host, status: d.status, reputation: d.reputation }));
    }
    // Metrics
    async getMetrics() {
        // TODO: add parsing for v2 response... returns weird string
        return this.service.$get('/metric');
    }
    // DAG
    async getTotalSupply() {
        return this.service.$get('/dag/total-supply');
    }
    async getTotalSupplyAtOrdinal(ordinal) {
        return this.service.$get(`/dag/${ordinal}/total-supply`);
    }
    async getAddressBalance(address) {
        return this.service.$get(`/dag/${address}/balance`);
    }
    async getAddressBalanceAtOrdinal(ordinal, address) {
        return this.service.$get(`/dag/${ordinal}/${address}/balance`);
    }
    // Global Snapshot
    // TODO: returns weird string
    async getLatestSnapshot() {
        return this.service.$get(`/global-snapshots/latest`);
    }
    async getLatestSnapshotOrdinal() {
        return this.service.$get(`/global-snapshots/latest/ordinal`);
    }
    // TODO: returns weird string
    async getSnapshot(id) {
        return this.service.$get(`/global-snapshots/${id}`);
    }
    // State Channels
    async postStateChannelSnapshot(address, snapshot) {
        return this.service.$post(`/state-channel/${address}/snapshot`, snapshot);
    }
}
export const l0Api = new L0Api();
//# sourceMappingURL=l0-api.js.map