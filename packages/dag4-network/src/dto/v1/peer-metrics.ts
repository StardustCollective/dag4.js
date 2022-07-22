
export class PeerMetrics {

  walletId: string;
  latency: number;
  pending?: boolean;
  nodeState: PeerNodeState;
  nodeStartTime: number
  peers: string[] = [];
  externalHost: string;
  TPS_all: number
  TPS_last_10_seconds: number;
  version: string;
  nextSnapshotHeight: number;
  address: string
  majorityHeight: number;
  balancesBySnapshot: string;
  snapshotAttempt_failure: number;
  rewardsBalance = 0;
  addressBalance = 0;
  alias: string;

  static createAsPending (host: string, status: PeerNodeState) {
    const result = new PeerMetrics();

    result.pending = true;
    result.nodeState = status;
    result.externalHost = host;

    return result;
  }

  static parse(rawMetrics: PeerMetricsRawData, latency: number) : PeerMetrics {
    const result = new PeerMetrics();

    result.latency = latency;
    result.walletId = rawMetrics.id;
    result.alias = rawMetrics.alias;
    result.version = rawMetrics.version;
    result.address = rawMetrics.address;
    result.nodeState = rawMetrics.nodeState as PeerNodeState;
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

  private static parsePeers(peers: string) {
    return peers.split(' --- ').map(item => item.substring(item.indexOf('http')))
  }
}

export type PeerMetricsRawData = {
  alias: string;
  nodeState: string; //'Ready'
  nodeStartTimeAgo: string;
  nodeStartTime: string;
  peers: string;
  externalHost: string;
  TPS_all: number
  TPS_last_10_seconds: string;
  version: string;
  nextSnapshotHeight: string;
  address: string
  snapshotAttempt_failure: number;
  notConnected: boolean;


  //genesisAccepted = true;
  cluster_ownJoinedHeight: number;
  // nodeState_success = 20;
  totalNumCBsInShapshots: number;
  resolveMajorityCheckpointBlockUniquesCount_2: number;
  // lastSnapshotHash = 480308934a687e9cf2206b7ec5d5fd506500af45c66a582b1a84a56f68a25bad;
  checkpointTipsRemoved: number;
  redownload_maxCreatedSnapshotHeight: number;
  peerApiRXFinishedCheckpoint: number;
  consensus_participateInRound: number;
  nodeStartTimeMS: number; //Date
  transactionAccepted: number;
  snapshotAttempt_heightIntervalNotMet: number;
  acceptMajorityCheckpointBlockUniquesCount_1: number;
  resolveMajorityCheckpointBlockProposalCount_3: number;
  peerAddedFromRegistrationFlow: number;
  rewards_snapshotReward: number;
  rewards_snapshotRewardWithoutStardust: number;
  trustDataPollingRound: number;
  blacklistedAddressesSize: number;
  rewards_stardustBalanceAfterReward: number;
  consensus_participateInRound_invalidNodeStateError: number; //short
  deadPeer: string;
  acceptedCBCacheMatchesAcceptedSize: boolean;
  awaitingForAcceptance: number; //short
  snapshotHeightIntervalConditionMet: number;
  writeSnapshot_success: number;
  snapshotWriteToDisk_success: number;
  channelCount: number; //short
  observationService_unknown_size: number; //short
  addressCount: number; //int
  snapshotAttempt_success: number;
  id: string;
  transactionService_accepted_size: number;
  checkpointsAcceptedWithDummyTxs: number;
  allowedForAcceptance: number;
  rewards_selfBalanceAfterReward: number;
  snapshotCount: number;
  observationService_inConsensus_size: number; //short
  addPeerWithRegistrationSymmetric_success: number; //short
  balancesBySnapshot: string;// = DAG0Ufhr 138256139724316; DAG0vyN4 113817062212490; DAG1KUCC 134532557390060; DAG1U4Ld 112835429477129; DAG1WwnS 138256139724316; DAG1bh6Q 135762015494201; DAG1hQvN 138345028698376; DAG2o2Jg 136143312612927; DAG4DG1y 58890750169970; DAG63PZk 60784656013032; DAG6Dx2X 107003798262138; DAG6EgC5 136947159448054; DAG6moTU 73743364226199; DAG6r14j 118300239239244; DAG7yyXi 88757662764286;
  rewards_lastRewardedHeight: number;
  redownload_lastSentHeight: number; //short
  minTipHeight: number;
  consensus_startOwnRound_consensusError: number; //short
  checkpointTipsIncremented: number;
  consensus_startOwnRound: number;
  consensus_startOwnRound_noPeersForConsensusError: number; //short
  checkpointValidationSuccess: number;
  redownload_maxAcceptedSnapshotHeight: number;
  redownload_lastMajorityStateHeight: number;
  consensus_startOwnRound_unknownError : number; //short
  acceptedCBSinceSnapshot: number;
  checkpointAccepted: number;
  acceptMajorityCheckpointBlockSelectedCount_3: number;
  transactionAcceptedFromRedownload: number;
  badPeerAdditionAttempt: number;
  // nodeCurrentTimeMS = 1590973502568;
  consensus_startOwnRound_consensusStartError: number; //short
  rewards_selfSnapshotReward: number;
  metricsRound: number;
  // genesisHash = e2c7316729b426ea15a4471b9d742ef42e57b68a85606e597d0a40385203e834;
  // peers = 710b3 API = http =//54.177.239.156 =9000 --- 0619f API = http =//46.101.70.129 =9000 --- aa336 API = http =//167.99.25.87 =9000 --- e5272 API = http =//45.32.218.171 =9000 --- f6baa API = http =//198.211.96.168 =9000 --- 7bbda API = http =//165.22.70.165 =9000 --- 62988 API = http =//18.144.132.60 =9000 --- ff104 API = http =//38.92.129.138 =9000 --- effb0 API = http =//206.189.149.189 =9000 --- b8f7d API = http =//13.52.32.78 =9000 --- f0073 API = http =//13.57.146.157 =9000 --- 87c8b API = http =//34.91.142.112 =9000 --- e0c1e API = http =//54.219.13.163 =9000 --- f3d72 API = http =//184.169.207.196 =9000;
  rewards_snapshotCount: number;
  reDownloadFinished_total: number;
  syncBufferSize: number; //short
  lastSnapshotHeight: number;
  observationService_accepted_size: number; //short
  observationService_pending_size: number; //short
  transactionService_pending_size: number; //short
  rewards_stardustSnapshotReward: number;
  snapshotHeightIntervalConditionNotMet: number;
  checkpointAcceptBlockAlreadyStored: number;
  activeTips: number; //short
  transactionService_inConsensus_size: number; //short
}


export enum PeerNodeState {
  Ready = 'Ready',
  Offline = 'Offline',
  DownloadInProgress = 'DownloadInProgress',
  PendingDownload = 'PendingDownload'
}
