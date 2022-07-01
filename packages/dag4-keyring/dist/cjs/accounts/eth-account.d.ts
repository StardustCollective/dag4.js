import { IKeyringAccount, KeyringAssetType, KeyringNetwork } from '../kcs';
import { EcdsaAccount } from './ecdsa-account';
export declare class EthAccount extends EcdsaAccount implements IKeyringAccount {
    decimals: number;
    network: KeyringNetwork;
    hasTokenSupport: boolean;
    supportedAssets: KeyringAssetType[];
    tokens: string[];
    saveTokenInfo(address: string): void;
    validateAddress(address: string): boolean;
    /**
     * Adds a healthy buffer of gas to an initial gas estimate.
     */
    signTransaction(tx: any): any;
    verifyMessage(msg: string, signature: string, saysAddress: string): boolean;
    getAddressFromPublicKey(publicKey: string): string;
    getEncryptionPublicKey(): string;
}
