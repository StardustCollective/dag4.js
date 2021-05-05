
export enum KeyringNetwork {
  Constellation = 'Constellation',
  Ethereum = 'Ethereum'
}

export enum KeyringWalletType {
  TempChainWallet = 'TEMP',
  MultiChainWallet = 'MCW',
  SimpleAccountWallet = 'SAW'
}

export enum KeyringAssetType {
  DAG = 'DAG',
  ETH = 'ETH',
  ERC20 = 'ERC20'
}

export type KeyringWalletSerialized = {
  type: string,
  label: string,
  secret: string,
  network?: KeyringNetwork,
  accounts?: { network: string, tokens?: string[] }[]
}

export type KeyringWalletState = {
  id: string;
  label: string,
  type: KeyringWalletType,
  supportedAssets: KeyringAssetType[],
  accounts: {
    address: string,
    network: KeyringNetwork,
    assets: KeyringAssetInfo[]
  }[]
}

export type KeyringAccountSerialized = {
  privateKey?: string;
  tokens?: string[]
}

export type KeyringAccountState = {
  address: string;
  tokens?: KeyringAssetInfo[];
  supportedAssets: KeyringAssetType[];
}

export type KeyringAssetInfo = {
  id: string;
  label: string;
  symbol: string;
  decimals: number;
  native?: true;
  network?: string;
  address?: string;
}

export interface IKeyringAccount {
  create (privateKey: string): IKeyringAccount;
  serialize (): KeyringAccountSerialized;
  deserialize (data: KeyringAccountSerialized): IKeyringAccount;
  signTransaction (address: string, tx, opts?: any);
  signMessage (address: string, data: string, opts?: any);
  //signPersonalMessage (address: string, msgHex: string, opts?: any);
  //getEncryptionPublicKey (address: string, opts?: any);
  //decryptMessage (address: string, data: EthEncryptedData);
  //signTypedData (address: string, typedData: any, opts?: any);
  getPrivateKey (): string;
  getNetwork (): KeyringNetwork;
  getAddress (): string;
  validateAddress (address: string);
  saveTokenInfo (token: KeyringAssetInfo): void;
  getAssetTypes(): string[];
  getAssetList(): KeyringAssetInfo[];
  getState (): KeyringAccountState;
}

export interface IKeyringWallet {
  readonly type: KeyringWalletType;
  readonly id:string;
  readonly supportedAssets: KeyringAssetType[];
  serialize (): KeyringWalletSerialized;
  deserialize (data: KeyringWalletSerialized);
  addKeyring(hdPath: string);
  getAccounts(): IKeyringAccount[];
  removeAccount (account: IKeyringAccount);
  getAccountByAddress (address: string): IKeyringAccount;
  exportSecretKey(): string;
  getState (): KeyringWalletState;
  setLabel (label: string): void;
}

export interface IKeyring {
  // serialize (): any;
  deserialize (data: any);
  addAccounts(n: number);
  getAccounts(): IKeyringAccount[];
  getAssetTypes(): string[];
  getAssetList(): KeyringAssetInfo[];
  removeAccount (account: IKeyringAccount);
  //exportAccount (account: IKeyringAccount): string;
  getAccountByAddress (address: string): IKeyringAccount;
}
