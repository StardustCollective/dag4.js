import { KeyringNetwork, IKeyring, IKeyringAccount, KeyringAccountSerialized, KeyringRingSerialized } from '../kcs';
export declare class SimpleKeyring implements IKeyring {
    private account;
    private network;
    constructor();
    static createForNetwork(network: KeyringNetwork, privateKey: string): SimpleKeyring;
    getState(): {
        network: KeyringNetwork;
        account: KeyringAccountSerialized;
    };
    serialize(): KeyringRingSerialized;
    deserialize({ network, accounts }: KeyringRingSerialized): void;
    addAccountAt(index?: number): void;
    getAccounts(): IKeyringAccount[];
    getAccountByAddress(address: string): IKeyringAccount;
    removeAccount(account: IKeyringAccount): void;
}
