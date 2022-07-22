export enum PeerNodeState {
  Ready = 'Ready',
  Offline = 'Offline',
  DownloadInProgress = 'DownloadInProgress',
  PendingDownload = 'PendingDownload'
}

export type ClusterPeerInfoV2 = {
  ip: string;
  alias: string;
  status: PeerNodeState;
  walletId: string;
  reputation: number;
}

export type ClusterInfoV2 = {
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