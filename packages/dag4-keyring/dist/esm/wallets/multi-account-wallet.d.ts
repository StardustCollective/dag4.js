import { IKeyringWallet, IKeyringAccount, KeyringNetwork, KeyringWalletSerialized, KeyringWalletType } from '../kcs';
import { BIP39_WORD_COUNT } from '../bip39-helper';
export declare class MultiAccountWallet implements IKeyringWallet {
    readonly type = KeyringWalletType.MultiAccountWallet;
    readonly id: string;
    readonly supportedAssets: any[];
    private label;
    private keyring;
    private mnemonic;
    private network;
    create(network: KeyringNetwork, mnemonic: string | BIP39_WORD_COUNT, label: string, numOfAccounts?: number): void;
    setLabel(val: string): void;
    getLabel(): string;
    getNetwork(): KeyringNetwork;
    getState(): {
        id: string;
        type: KeyringWalletType;
        label: string;
        supportedAssets: any[];
        accounts: import("../kcs").KeyringAccountState[];
    };
    serialize(): KeyringWalletSerialized;
    deserialize(data: KeyringWalletSerialized): void;
    importAccount(hdPath: string, label: string): any;
    getAccounts(): IKeyringAccount[];
    getAccountByAddress(address: string): IKeyringAccount;
    addAccount(): void;
    setNumOfAccounts(num: number): void;
    removeAccount(account: IKeyringAccount): void;
    exportSecretKey(): string;
}
