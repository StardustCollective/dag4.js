/// <reference types="node" />
import * as EC from "elliptic";
import EthereumHDKey from 'ethereumjs-wallet/dist/hdkey';
import { hdkey } from 'ethereumjs-wallet';
import { KeyTrio } from './key-trio';
import { KDFParamsPhrase, KDFParamsPrivateKey, V3Keystore } from './v3-keystore';
import { AddressLastRef } from "./transaction";
import { AddressLastRefV2 } from "./transaction-v2";
export declare enum DERIVATION_PATH {
    DAG = 0,
    ETH = 1,
    ETH_LEDGER = 2
}
export declare class KeyStore {
    sha512(hash: string | Buffer): string;
    sha256(hash: string | Buffer): string;
    generateSeedPhrase(): any;
    generatePrivateKey(): string;
    encryptPhrase(phrase: string, password: string): Promise<V3Keystore<KDFParamsPhrase>>;
    decryptPhrase(jKey: V3Keystore<KDFParamsPhrase>, password: any): Promise<string>;
    generateEncryptedPrivateKey(password: string, privateKey?: string): Promise<V3Keystore<KDFParamsPhrase | KDFParamsPrivateKey>>;
    decryptPrivateKey(jKey: V3Keystore<KDFParamsPrivateKey>, password: any): Promise<string>;
    isValidJsonPrivateKey(jKey: V3Keystore<KDFParamsPrivateKey>): boolean;
    getExtendedPrivateKeyFromMnemonic(mnemonic: string): Buffer;
    getPrivateKeyFromMnemonic(mnemonic: string, derivationPath?: DERIVATION_PATH): string;
    getMasterKeyFromMnemonic(mnemonic: string, derivationPath?: DERIVATION_PATH): HDKey;
    deriveAccountFromMaster(masterKey: hdkey, index: number): string;
    sign(privateKey: string, msg: string): string;
    verify(publicKey: string, msg: string, signature: EC.SignatureInput): any;
    validateDagAddress(address: string): boolean;
    getPublicKeyFromPrivate(privateKey: string, compact?: boolean): string;
    getDagAddressFromPrivateKey(privateKeyHex: string): string;
    getEthAddressFromPrivateKey(privateKeyHex: string): string;
    getDagAddressFromPublicKey(publicKeyHex: string): string;
    generateTransaction(amount: number, toAddress: string, keyTrio: KeyTrio, lastRef: AddressLastRef, fee?: number): Promise<any>;
    generateTransactionV2(amount: number, toAddress: string, keyTrio: KeyTrio, lastRef: AddressLastRefV2, fee?: number): Promise<{
        value: {
            salt: string;
            source: string;
            destination: string;
            amount: number;
            fee: number;
            parent: AddressLastRefV2;
        };
        proofs: import("./transaction-v2").Proof[];
    }>;
    prepareTx(amount: number, toAddress: string, fromAddress: string, lastRef: AddressLastRef | AddressLastRefV2, fee?: number, version?: string): {
        tx: any;
        hash: string;
        rle: any;
    };
}
export declare const keyStore: KeyStore;
export declare type HDKey = EthereumHDKey;
