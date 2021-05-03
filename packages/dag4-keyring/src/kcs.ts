
export enum KeyringNetwork {
  Constellation = 'Constellation',
  Ethereum = 'Ethereum'
}

export enum KeyringWalletType {
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
  network?: KeyringNetwork
}

export type KeyringWalletState = {
  id: string;
  type: string,
  label: string,
  supportAssets: KeyringAssetType[],
  accounts: KeyringAccountState[]
}

export type KeyringAccountSerialized = {
  label: string;
  privateKey?: string;
}

export type KeyringAccountState = {
  label: string;
  address: string;
  supportAssets: KeyringAssetType[]
}

export interface IKeyringAccount {
  create (privateKey: string, label: string): IKeyringAccount;
  serialize (): KeyringAccountSerialized;
  deserialize (data: KeyringAccountSerialized): IKeyringAccount;
  signTransaction (address: string, tx, opts?: any);
  signMessage (address: string, data: string, opts?: any);
  //signPersonalMessage (address: string, msgHex: string, opts?: any);
  //getEncryptionPublicKey (address: string, opts?: any);
  //decryptMessage (address: string, data: EthEncryptedData);
  //signTypedData (address: string, typedData: any, opts?: any);
  getPrivateKey (): string;
  getAddress (): string;
  validateAddress (address: string);

  getState (): KeyringAccountState;
}

export interface IKeyringWallet {
  readonly type: KeyringWalletType;
  readonly id:string;
  readonly supportAssets: KeyringAssetType[];
  serialize (): KeyringWalletSerialized;
  deserialize (data: KeyringWalletSerialized);
  addKeyring(hdPath: string);
  getAccounts(): IKeyringAccount[];
  removeAccount (account: IKeyringAccount);
  getAccountByAddress (address: string): IKeyringAccount;
  exportSecretKey(): string;
  getState (): KeyringWalletState;
}

export interface IKeyring {
  serialize (): any;
  deserialize (data: any);
  addAccounts(n: number);
  getAccounts(): IKeyringAccount[];
  removeAccount (account: IKeyringAccount);
  //exportAccount (account: IKeyringAccount): string;
  getAccountByAddress (address: string): IKeyringAccount;
}
