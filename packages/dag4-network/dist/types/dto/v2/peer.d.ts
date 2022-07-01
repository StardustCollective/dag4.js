export declare enum PeerNodeState {
    Ready = "Ready",
    Offline = "Offline",
    DownloadInProgress = "DownloadInProgress",
    PendingDownload = "PendingDownload"
}
export declare type ClusterPeerInfo = {
    ip: string;
    alias: string;
    status: PeerNodeState;
    walletId: string;
    reputation: number;
};
export declare type ClusterInfo = {
    "alias": string;
    "id": {
        "hex": string;
    };
    "ip": {
        "host": string;
        "port": number;
    };
    "status": PeerNodeState;
    "reputation": number;
};
