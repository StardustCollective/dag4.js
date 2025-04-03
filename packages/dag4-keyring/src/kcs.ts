import {Web3Provider} from "./web3/Web3Provider";

/**
 * Enum representing the supported blockchain networks.
 */
export enum KeyringNetwork {
  Constellation = 'Constellation',
  Ethereum = 'Ethereum'
}

/**
 * Enum representing the different types of wallets supported by the keyring system.
 */
export enum KeyringWalletType {
  MultiChainWallet = 'MCW',
  CrossChainWallet = 'CCW',
  MultiAccountWallet = 'MAW',   //Single Chain, Multiple seed accounts, MSW
  SingleAccountWallet = 'SAW',  //Single Chain, Single Key account, SKW
  MultiKeyWallet = 'MKW',       //Single Chain, Multiple Key accounts, MKW
  LedgerAccountWallet = "LAW",
  BitfiAccountWallet  = "BAW"
}

/**
 * Enum representing the different types of assets supported by the keyring system.
 */
export enum KeyringAssetType {
  DAG = 'DAG',
  ETH = 'ETH',
  ERC20 = 'ERC20'
}

/**
 * Type representing a serialized wallet.
 */
export type KeyringWalletSerialized = {
  type: string;
  label: string;
  secret?: string;
  numOfAccounts?: number;
  network?: KeyringNetwork;
  rings?: KeyringRingSerialized[];
  accounts?: KeyringAccountSerialized[];
}

/**
 * Type representing the state of a wallet.
 */
export type KeyringWalletState = {
  id: string;
  bipIndex?: number;
  label: string;
  type: KeyringWalletType;
  supportedAssets: KeyringAssetType[];
  accounts: KeyringWalletAccountState[];
}

/**
 * Type representing the state of a wallet account.
 */
export type KeyringWalletAccountState = {
  address: string;
  network?: KeyringNetwork;
  tokens?: string[];
  publicKey?: string;
  deviceId?: string;
}

/**
 * Type representing a serialized keyring.
 */
export type KeyringRingSerialized = {
  network: KeyringNetwork;
  accounts: KeyringAccountSerialized[];
}

/**
 * Type representing a serialized account.
 */
export type KeyringAccountSerialized = {
  label?: string;
  privateKey?: string;
  publicKey?: string;
  tokens?: string[];
  bip44Index?: number;
}

/**
 * Type representing the state of an account.
 */
export type KeyringAccountState = {
  address: string;
  label? : string;
  tokens?: string[];
  supportedAssets: KeyringAssetType[];
}

/**
 * Type representing information about an asset.
 */
export type KeyringAssetInfo = {
  id: string;
  label: string;
  symbol: string;
  decimals: number;
  native?: true;
  network?: string;
  address?: string;
}

/**
 * Interface for keyring accounts.
 * Defines the methods that all account implementations must provide.
 */
export interface IKeyringAccount {
  /**
   * Creates a new account with the given private key.
   * @param privateKey - The private key for the account
   * @returns The created account instance
   */
  create (privateKey: string): IKeyringAccount;
  
  /**
   * Serializes the account data.
   * @param includeSecret - Whether to include the private key in the serialized data
   * @returns The serialized account data
   */
  serialize (includeSecret: boolean): KeyringAccountSerialized;
  
  /**
   * Deserializes account data.
   * @param data - The serialized account data
   * @returns The account instance
   */
  deserialize (data: KeyringAccountSerialized): IKeyringAccount;
  
  /**
   * Gets the account label.
   * @returns The account label
   */
  getLabel(): string;
  
  /**
   * Gets the number of decimal places for the account's native asset.
   * @returns The number of decimal places
   */
  getDecimals(): number;
  
  /**
   * Signs a message.
   * @param msg - The message to sign
   * @returns The signature
   */
  signMessage(msg: string): string;
  
  /**
   * Verifies a message signature.
   * @param msg - The original message
   * @param signature - The signature to verify
   * @param saysAddress - The address that claims to have signed the message
   * @returns True if the signature is valid, false otherwise
   */
  verifyMessage(msg: string, signature: string, saysAddress: string): boolean;
  
  /**
   * Signs a transaction.
   * @param address - The address to sign the transaction for
   * @param tx - The transaction to sign
   * @param opts - Additional options
   */
  signTransaction (address: string, tx, opts?: any);
  
  /**
   * Signs a message.
   * @param address - The address to sign the message for
   * @param data - The message data to sign
   * @param opts - Additional options
   */
  signMessage (address: string, data: string, opts?: any);
  
  /**
   * Gets the Web3 provider for the account.
   * @returns The Web3 provider
   */
  getWeb3Provider (): Web3Provider;
  
  /**
   * Sets the Web3 provider for the account.
   * @param provider - The Web3 provider to set
   */
  setWeb3Provider (provider: Web3Provider): void;
  
  /**
   * Gets the account's private key.
   * @returns The private key
   */
  getPrivateKey (): string;
  
  /**
   * Gets the network the account belongs to.
   * @returns The network
   */
  getNetwork (): KeyringNetwork;
  
  /**
   * Gets the account's address.
   * @returns The account address
   */
  getAddress (): string;
  
  /**
   * Gets the tokens associated with the account.
   * @returns The token addresses
   */
  getTokens (): string[];
  
  /**
   * Sets the tokens for the account.
   * @param tokens - The token addresses to set
   */
  setTokens (tokens: string[]);
  
  /**
   * Gets the BIP44 index for the account.
   * @returns The BIP44 index
   */
  getBip44Index (): number;
  
  /**
   * Validates an address.
   * @param address - The address to validate
   * @returns True if the address is valid, false otherwise
   */
  validateAddress (address: string);
  
  /**
   * Saves token information.
   * @param address - The token address to save
   */
  saveTokenInfo (address: string): void;
  
  /**
   * Gets the account state.
   * @returns The account state
   */
  getState (): KeyringAccountState;
}

/**
 * Interface for keyring wallets.
 * Defines the methods that all wallet implementations must provide.
 */
export interface IKeyringWallet {
  /**
   * The type of wallet.
   */
  readonly type: KeyringWalletType;
  
  /**
   * The wallet ID.
   */
  readonly id:string;
  
  /**
   * The assets supported by the wallet.
   */
  readonly supportedAssets: KeyringAssetType[];
  
  /**
   * Serializes the wallet data.
   * @returns The serialized wallet data
   */
  serialize (): KeyringWalletSerialized;
  
  /**
   * Deserializes wallet data.
   * @param data - The serialized wallet data
   */
  deserialize (data: KeyringWalletSerialized);
  
  /**
   * Imports an account with the given secret.
   * @param secret - The account secret (private key or seed phrase)
   * @param label - The account label
   * @returns The imported account
   */
  importAccount(secret: string, label: string): IKeyringAccount;
  
  /**
   * Gets all accounts in the wallet.
   * @returns The accounts
   */
  getAccounts(): IKeyringAccount[];
  
  /**
   * Removes an account from the wallet.
   * @param account - The account to remove
   */
  removeAccount (account: IKeyringAccount);
  
  /**
   * Gets an account by its address.
   * @param address - The account address
   * @returns The account, or null if not found
   */
  getAccountByAddress (address: string): IKeyringAccount;
  
  /**
   * Exports the wallet's secret key.
   * @returns The secret key
   */
  exportSecretKey(): string;
  
  /**
   * Gets the wallet state.
   * @returns The wallet state
   */
  getState (): KeyringWalletState;
  
  /**
   * Sets the wallet label.
   * @param label - The label to set
   */
  setLabel (label: string): void;
  
  /**
   * Gets the wallet label.
   * @returns The wallet label
   */
  getLabel(): string;
  
  /**
   * Gets the network the wallet belongs to.
   * @returns The network
   */
  getNetwork(): string;
}

/**
 * Interface for keyrings.
 * Defines the methods that all keyring implementations must provide.
 */
export interface IKeyring {
  /**
   * Serializes the keyring data.
   * @returns The serialized keyring data
   */
  serialize (): KeyringRingSerialized;
  
  /**
   * Deserializes keyring data.
   * @param data - The serialized keyring data
   */
  deserialize (data: KeyringRingSerialized);
  
  /**
   * Adds an account at the specified index.
   * @param index - The index to add the account at
   */
  addAccountAt(index?: number);
  
  /**
   * Gets all accounts in the keyring.
   * @returns The accounts
   */
  getAccounts(): IKeyringAccount[];
  
  /**
   * Removes an account from the keyring.
   * @param account - The account to remove
   */
  removeAccount (account: IKeyringAccount);
  
  /**
   * Gets an account by its address.
   * @param address - The account address
   * @returns The account, or null if not found
   */
  getAccountByAddress (address: string): IKeyringAccount;
}
