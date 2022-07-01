import { PeerNodeState } from './peer-metrics';
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
