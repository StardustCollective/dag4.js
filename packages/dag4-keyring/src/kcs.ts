import {Web3Provider} from "./web3/Web3Provider";


export enum KeyringNetwork {
  Constellation = 'Constellation',
  Ethereum = 'Ethereum'
}

export enum KeyringWalletType {
  MultiChainWallet = 'MCW',
  CrossChainWallet = 'CCW',
  MultiAccountWallet = 'MAW',   //Single Chain, Multiple seed accounts, MSW
  SingleAccountWallet = 'SAW',  //Single Chain, Single Key account, SKW
  MultiKeyWallet = 'MKW',       //Single Chain, Multiple Key accounts, MKW
  LedgerAccountWallet = "LAW",
  BitfiAccountWallet  = "BAW"
}

export enum KeyringAssetType {
  DAG = 'DAG',
  ETH = 'ETH',
  ERC20 = 'ERC20'
}

export type KeyringWalletSerialized = {
  type: string;
  label: string;
  secret?: string;
  numOfAccounts?: number;
  network?: KeyringNetwork;
  rings?: KeyringRingSerialized[];
  accounts?: KeyringAccountSerialized[];
}

export type KeyringWalletState = {
  id: string;
  bipIndex?: number;
  label: string;
  type: KeyringWalletType;
  supportedAssets: KeyringAssetType[];
  accounts: KeyringWalletAccountState[];
}

export type KeyringWalletAccountState = {
  address: string;
  network?: KeyringNetwork;
  tokens?: string[];
  publicKey?: string;
  deviceId?: string;
}

export type KeyringRingSerialized = {
  network: KeyringNetwork;
  accounts: KeyringAccountSerialized[];
}

export type KeyringAccountSerialized = {
  label?: string;
  privateKey?: string;
  publicKey?: string;
  tokens?: string[];
  bip44Index?: number;
}

export type KeyringAccountState = {
  address: string;
  label? : string;
  tokens?: string[];
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
  serialize (includeSecret: boolean): KeyringAccountSerialized;
  deserialize (data: KeyringAccountSerialized): IKeyringAccount;
  getLabel(): string;
  getDecimals(): number;
  signMessage(msg: string): string;
  verifyMessage(msg: string, signature: string, saysAddress: string): boolean;
  signTransaction (address: string, tx, opts?: any);
  signMessage (address: string, data: string, opts?: any);
  //signPersonalMessage (address: string, msgHex: string, opts?: any);
  //getEncryptionPublicKey (address: string, opts?: any);
  //decryptMessage (address: string, data: EthEncryptedData);
  //signTypedData (address: string, typedData: any, opts?: any);
  getWeb3Provider (): Web3Provider;
  setWeb3Provider (provider: Web3Provider): void;
  getPrivateKey (): string;
  getNetwork (): KeyringNetwork;
  getAddress (): string;
  getTokens (): string[];
  setTokens (tokens: string[]);
  getBip44Index (): number;
  validateAddress (address: string);
  saveTokenInfo (address: string): void;
  getState (): KeyringAccountState;
}

export interface IKeyringWallet {
  readonly type: KeyringWalletType;
  readonly id:string;
  readonly supportedAssets: KeyringAssetType[];
  serialize (): KeyringWalletSerialized;
  deserialize (data: KeyringWalletSerialized);
  importAccount(secret: string, label: string): IKeyringAccount;
  getAccounts(): IKeyringAccount[];
  removeAccount (account: IKeyringAccount);
  getAccountByAddress (address: string): IKeyringAccount;
  exportSecretKey(): string;
  getState (): KeyringWalletState;
  setLabel (label: string): void;
  getLabel(): string;
  getNetwork(): string;
}

export interface IKeyring {
  serialize (): KeyringRingSerialized;
  deserialize (data: KeyringRingSerialized);
  addAccountAt(index?: number);
  getAccounts(): IKeyringAccount[];
  removeAccount (account: IKeyringAccount);
  //exportAccount (account: IKeyringAccount): string;
  getAccountByAddress (address: string): IKeyringAccount;
}
