import { IKeyringAccount, IKeyringWallet, KeyringNetwork, KeyringWalletSerialized, KeyringWalletType } from '../kcs';
export declare class SingleAccountWallet implements IKeyringWallet {
    readonly type = KeyringWalletType.SingleAccountWallet;
    readonly id: string;
    readonly supportedAssets: any[];
    private keyring;
    private network;
    private label;
    create(network: KeyringNetwork, privateKey: string, label: string): void;
    setLabel(val: string): void;
    getLabel(): string;
    getNetwork(): KeyringNetwork;
    getState(): {
        id: string;
        type: KeyringWalletType;
        label: string;
        supportedAssets: any[];
        accounts: {
            address: string;
            network: KeyringNetwork;
            tokens: string[];
        }[];
    };
    serialize(): KeyringWalletSerialized;
    deserialize(data: KeyringWalletSerialized): void;
    importAccount(hdPath: string, label: string): any;
    getAccounts(): IKeyringAccount[];
    getAccountByAddress(address: string): IKeyringAccount;
    removeAccount(account: IKeyringAccount): void;
    exportSecretKey(): string;
}
