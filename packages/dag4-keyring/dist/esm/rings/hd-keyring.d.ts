import { KeyringNetwork, IKeyring, IKeyringAccount, KeyringRingSerialized } from '../kcs';
export declare const BIP_44_PATHS: {
    CONSTELLATION_PATH: string;
    ETH_WALLET_PATH: string;
    ETH_WALLET_LEDGER_PATH: string;
};
export declare class HdKeyring implements IKeyring {
    private accounts;
    private hdPath;
    private mnemonic;
    private extendedKey;
    private rootKey;
    private network;
    static createFromExtendedKey(extendedKey: string, network: KeyringNetwork, numberOfAccounts: number): HdKeyring;
    static create(mnemonic: string, hdPath: string, network: KeyringNetwork, numberOfAccounts: number): HdKeyring;
    getNetwork(): KeyringNetwork;
    getHdPath(): string;
    getExtendedPublicKey(): string;
    serialize(): KeyringRingSerialized;
    deserialize(data: KeyringRingSerialized): void;
    private createAccounts;
    removeLastAddedAccount(): void;
    addAccountAt(index?: number): IKeyringAccount;
    getAccounts(): IKeyringAccount[];
    private _initFromMnemonic;
    private _initFromExtendedKey;
    exportAccount(account: IKeyringAccount): string;
    getAccountByAddress(address: string): IKeyringAccount;
    removeAccount(account: IKeyringAccount): void;
}
