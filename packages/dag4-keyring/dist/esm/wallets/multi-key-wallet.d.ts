import { IKeyringWallet, IKeyringAccount, KeyringNetwork, KeyringWalletSerialized, KeyringWalletType } from '../kcs';
export declare class MultiKeyWallet implements IKeyringWallet {
    readonly type = KeyringWalletType.MultiKeyWallet;
    readonly id: string;
    readonly supportedAssets: any[];
    private keyRings;
    private network;
    private label;
    create(network: KeyringNetwork, label: string): void;
    setLabel(val: string): void;
    getLabel(): string;
    getNetwork(): KeyringNetwork;
    getState(): {
        id: string;
        type: KeyringWalletType;
        label: string;
        network: KeyringNetwork;
        supportedAssets: any[];
        accounts: {
            address: string;
            label: string;
        }[];
    };
    serialize(): KeyringWalletSerialized;
    deserialize(data: KeyringWalletSerialized): void;
    importAccount(secret: string, label: string): IKeyringAccount;
    getAccounts(): IKeyringAccount[];
    getAccountByAddress(address: string): IKeyringAccount;
    removeAccount(account: IKeyringAccount): void;
    exportSecretKey(): string;
}
