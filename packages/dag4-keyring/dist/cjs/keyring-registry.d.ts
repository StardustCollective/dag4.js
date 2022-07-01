import { IKeyringAccount, KeyringNetwork } from './kcs';
declare type Constructor<T> = new () => T;
declare class KeyringRegistry {
    registry: Map<string, Constructor<IKeyringAccount>>;
    registerAccountClass(id: KeyringNetwork, clazz: Constructor<IKeyringAccount>): void;
    createAccount(id: KeyringNetwork): IKeyringAccount;
}
export declare const keyringRegistry: KeyringRegistry;
export {};
