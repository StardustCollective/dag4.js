import { Web3Provider } from "./web3/Web3Provider";
export declare enum KeyringNetwork {
    Constellation = "Constellation",
    Ethereum = "Ethereum"
}
export declare enum KeyringWalletType {
    MultiChainWallet = "MCW",
    CrossChainWallet = "CCW",
    MultiAccountWallet = "MAW",
    SingleAccountWallet = "SAW",
    MultiKeyWallet = "MKW"
}
export declare enum KeyringAssetType {
    DAG = "DAG",
    ETH = "ETH",
    ERC20 = "ERC20"
}
export declare type KeyringWalletSerialized = {
    type: string;
    label: string;
    secret?: string;
    numOfAccounts?: number;
    network?: KeyringNetwork;
    rings?: KeyringRingSerialized[];
    accounts?: KeyringAccountSerialized[];
};
export declare type KeyringWalletState = {
    id: string;
    label: string;
    type: KeyringWalletType;
    supportedAssets: KeyringAssetType[];
    accounts: KeyringWalletAccountState[];
};
export declare type KeyringWalletAccountState = {
    address: string;
    network?: KeyringNetwork;
    tokens?: string[];
};
export declare type KeyringRingSerialized = {
    network: KeyringNetwork;
    accounts: KeyringAccountSerialized[];
};
export declare type KeyringAccountSerialized = {
    label?: string;
    privateKey?: string;
    publicKey?: string;
    tokens?: string[];
    bip44Index?: number;
};
export declare type KeyringAccountState = {
    address: string;
    label?: string;
    tokens?: string[];
    supportedAssets: KeyringAssetType[];
};
export declare type KeyringAssetInfo = {
    id: string;
    label: string;
    symbol: string;
    decimals: number;
    native?: true;
    network?: string;
    address?: string;
};
export interface IKeyringAccount {
    create(privateKey: string): IKeyringAccount;
    serialize(includeSecret: boolean): KeyringAccountSerialized;
    deserialize(data: KeyringAccountSerialized): IKeyringAccount;
    getLabel(): string;
    getDecimals(): number;
    signMessage(msg: string): string;
    verifyMessage(msg: string, signature: string, saysAddress: string): boolean;
    signTransaction(address: string, tx: any, opts?: any): any;
    signMessage(address: string, data: string, opts?: any): any;
    getWeb3Provider(): Web3Provider;
    setWeb3Provider(provider: Web3Provider): void;
    getPrivateKey(): string;
    getNetwork(): KeyringNetwork;
    getAddress(): string;
    getTokens(): string[];
    setTokens(tokens: string[]): any;
    getBip44Index(): number;
    validateAddress(address: string): any;
    saveTokenInfo(address: string): void;
    getState(): KeyringAccountState;
}
export interface IKeyringWallet {
    readonly type: KeyringWalletType;
    readonly id: string;
    readonly supportedAssets: KeyringAssetType[];
    serialize(): KeyringWalletSerialized;
    deserialize(data: KeyringWalletSerialized): any;
    importAccount(secret: string, label: string): IKeyringAccount;
    getAccounts(): IKeyringAccount[];
    removeAccount(account: IKeyringAccount): any;
    getAccountByAddress(address: string): IKeyringAccount;
    exportSecretKey(): string;
    getState(): KeyringWalletState;
    setLabel(label: string): void;
    getLabel(): string;
    getNetwork(): string;
}
export interface IKeyring {
    serialize(): KeyringRingSerialized;
    deserialize(data: KeyringRingSerialized): any;
    addAccountAt(index?: number): any;
    getAccounts(): IKeyringAccount[];
    removeAccount(account: IKeyringAccount): any;
    getAccountByAddress(address: string): IKeyringAccount;
}
