export class PeerMonitorMetrics {
    static createAsPending(host, status) {
        const result = new PeerMonitorMetrics();
        result.pending = true;
        result.nodeState = status;
        result.externalHost = host;
        return result;
    }
    static parse(rawMetrics, latency) {
        const result = new PeerMonitorMetrics();
        result.latency = latency;
        result.alias = rawMetrics.alias;
        result.walletId = rawMetrics.id;
        result.version = rawMetrics.version;
        result.address = rawMetrics.address;
        result.nodeState = rawMetrics.nodeState;
        result.nodeStartTime = +rawMetrics.nodeStartTimeMS;
        result.externalHost = rawMetrics.externalHost;
        result.TPS_all = +rawMetrics.TPS_all;
        result.TPS_last_10_seconds = +rawMetrics.TPS_last_10_seconds;
        result.nextSnapshotHeight = +rawMetrics.nextSnapshotHeight;
        result.snapshotAttempt_failure = +rawMetrics.snapshotAttempt_failure || 0;
        result.majorityHeight = +rawMetrics.redownload_lastMajorityStateHeight || 0;
        return result;
    }
}
export class ClusterMonitorMetrics {
    constructor() {
        this.validatorCount = 0;
        this.version = '';
        this.avgTps = 0;
        this.totalTps = 0;
        this.maxHeight = 0;
        this.totalRewards = 0;
        this.stardustWalletBalance = 0;
    }
}
//# sourceMappingURL=monitor-metrics.js.map