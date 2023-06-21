type NetworkInfo = {
  id: string;
  beUrl?: string;
  lbUrl?: string;
  l0Url?: string;
  l1Url?: string;
  networkVersion?: string;
  testnet?: boolean;
};

type MetagraphNetworkInfo = {
  id: string;
  l0Url: string;
  l1Url: string;
  beUrl: string;
  metagraphId: string;
  testnet?: boolean;
};

export { NetworkInfo, MetagraphNetworkInfo };
