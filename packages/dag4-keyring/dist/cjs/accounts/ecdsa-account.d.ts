/// <reference types="node" />
import Wallet from 'ethereumjs-wallet';
import { KeyringAccountSerialized, KeyringAccountState, KeyringAssetType, KeyringNetwork } from '../kcs';
import { Asset } from './asset';
import { Web3Provider } from "../web3/Web3Provider";
export declare abstract class EcdsaAccount {
    protected tokens: string[];
    protected wallet: Wallet;
    protected assets: Asset[];
    protected bip44Index: number;
    abstract decimals: number;
    abstract network: KeyringNetwork;
    abstract hasTokenSupport: boolean;
    abstract supportedAssets: KeyringAssetType[];
    private provider;
    private label;
    abstract verifyMessage(msg: string, signature: string, saysAddress: string): boolean;
    getDecimals(): number;
    getLabel(): string;
    create(privateKey: string): this;
    saveTokenInfo(address: string): void;
    getWeb3Provider(): Web3Provider;
    setWeb3Provider(provider: Web3Provider): void;
    getTokens(): string[];
    setTokens(tokens: string[]): void;
    getBip44Index(): number;
    getState(): KeyringAccountState;
    getNetwork(): KeyringNetwork;
    serialize(includePrivateKey?: boolean): KeyringAccountSerialized;
    deserialize({ privateKey, publicKey, tokens, bip44Index, label }: KeyringAccountSerialized): this;
    signMessage(msg: string): string;
    recoverSignedMsgPublicKey(msg: string, signature: string): string;
    getAddress(): string;
    getPublicKey(): string;
    getPrivateKey(): string;
    protected getPrivateKeyBuffer(): Buffer;
}
