"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PeerNodeState = exports.PeerMetrics = void 0;
class PeerMetrics {
    walletId;
    latency;
    pending;
    nodeState;
    nodeStartTime;
    peers = [];
    externalHost;
    TPS_all;
    TPS_last_10_seconds;
    version;
    nextSnapshotHeight;
    address;
    majorityHeight;
    balancesBySnapshot;
    snapshotAttempt_failure;
    rewardsBalance = 0;
    addressBalance = 0;
    alias;
    static createAsPending(host, status) {
        const result = new PeerMetrics();
        result.pending = true;
        result.nodeState = status;
        result.externalHost = host;
        return result;
    }
    static parse(rawMetrics, latency) {
        const result = new PeerMetrics();
        result.latency = latency;
        result.walletId = rawMetrics.id;
        result.alias = rawMetrics.alias;
        result.version = rawMetrics.version;
        result.address = rawMetrics.address;
        result.nodeState = rawMetrics.nodeState;
        result.nodeStartTime = +rawMetrics.nodeStartTimeMS;
        result.externalHost = rawMetrics.externalHost;
        result.TPS_all = +rawMetrics.TPS_all;
        result.TPS_last_10_seconds = +rawMetrics.TPS_last_10_seconds;
        result.nextSnapshotHeight = +rawMetrics.nextSnapshotHeight;
        result.snapshotAttempt_failure = +rawMetrics.snapshotAttempt_failure || 0;
        result.majorityHeight = +rawMetrics.redownload_lastMajorityStateHeight;
        result.balancesBySnapshot = rawMetrics.balancesBySnapshot;
        // result.peers = PeerMetrics.parsePeers(rawMetrics.peers);
        return result;
    }
    static parsePeers(peers) {
        return peers.split(' --- ').map(item => item.substring(item.indexOf('http')));
    }
}
exports.PeerMetrics = PeerMetrics;
var PeerNodeState;
(function (PeerNodeState) {
    PeerNodeState["Ready"] = "Ready";
    PeerNodeState["Offline"] = "Offline";
    PeerNodeState["DownloadInProgress"] = "DownloadInProgress";
    PeerNodeState["PendingDownload"] = "PendingDownload";
})(PeerNodeState = exports.PeerNodeState || (exports.PeerNodeState = {}));
//# sourceMappingURL=peer-metrics.js.map