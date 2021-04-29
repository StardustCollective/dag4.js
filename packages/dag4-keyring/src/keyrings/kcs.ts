import {IKeyringAccount} from './keyring-account';

export enum KeyringChainId {
  Constellation = 'DAG',
  Ethereum = 'ETH'
}

export enum KeyringChainWalletId {
  MultiChainWallet = 'MCHD',
  SimpleChainWallet = 'SIMP'
}


export interface IKeyringChainWallet {
  type: KeyringChainWalletId;
  serialize (): any;
  deserialize (data: any);
  addKeyring(hdPath: string);
  getAccounts(): IKeyringAccount[];
  removeAccount (account: IKeyringAccount);
  getAccountByAddress (address: string): IKeyringAccount;
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
