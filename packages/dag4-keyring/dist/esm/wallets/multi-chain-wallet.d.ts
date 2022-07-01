import { IKeyringWallet, IKeyringAccount, KeyringAssetType, KeyringNetwork, KeyringWalletSerialized, KeyringWalletType } from '../kcs';
export declare class MultiChainWallet implements IKeyringWallet {
    readonly type = KeyringWalletType.MultiChainWallet;
    readonly id: string;
    readonly supportedAssets: KeyringAssetType[];
    private label;
    private keyrings;
    private mnemonic;
    create(label: string, mnemonic: string): void;
    setLabel(val: string): void;
    getLabel(): string;
    getNetwork(): string;
    getState(): {
        id: string;
        type: KeyringWalletType;
        label: string;
        supportedAssets: KeyringAssetType[];
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
