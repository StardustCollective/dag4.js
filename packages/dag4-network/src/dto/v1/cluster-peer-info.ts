import {PeerNodeState} from './peer-metrics';

export type ClusterPeerInfo = {
  ip: string;
  alias: string;
  status: PeerNodeState;
  walletId: string;
  reputation: number;
}

export type ClusterInfo = {
  "alias": string,
  "id": {
    "hex": string
  },
  "ip": {
    "host": string,
    "port": number //9001
  },
  "status": PeerNodeState,
  "reputation": number
}
