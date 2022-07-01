"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClusterMonitorMetrics = exports.PeerMonitorMetrics = void 0;
class PeerMonitorMetrics {
    userId;
    walletId;
    latency;
    nodeState;
    nodeStartTimeAgo;
    nodeStartTime;
    externalHost;
    TPS_all;
    TPS_last_10_seconds;
    version;
    nextSnapshotHeight;
    snapshotAttempt_failure;
    address;
    majorityHeight;
    rewardsBalance;
    addressBalance;
    pending;
    alias;
    //anchor?: string;
    label;
    star;
    rocRewards;
    rocTps10;
    rocTpsAll;
    rocLatency;
    rocPredictive;
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
exports.PeerMonitorMetrics = PeerMonitorMetrics;
class ClusterMonitorMetrics {
    validatorCount = 0;
    version = '';
    avgTps = 0;
    totalTps = 0;
    maxHeight = 0;
    totalRewards = 0;
    tooltip;
    rocTotalRewards;
    rocMaxHeight;
    stardustWalletBalance = 0;
}
exports.ClusterMonitorMetrics = ClusterMonitorMetrics;
//# sourceMappingURL=monitor-metrics.js.map