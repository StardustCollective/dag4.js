import { IKeyringAccount, KeyringAssetType, KeyringNetwork } from '../kcs';
import { EcdsaAccount } from './ecdsa-account';
export declare class DagAccount extends EcdsaAccount implements IKeyringAccount {
    decimals: number;
    network: KeyringNetwork;
    hasTokenSupport: boolean;
    supportedAssets: KeyringAssetType[];
    tokens: any;
    signTransaction(tx: any): void;
    validateAddress(address: string): boolean;
    getAddress(): string;
    verifyMessage(msg: string, signature: string, saysAddress: string): boolean;
    private sha256;
    private getAddressFromPublicKey;
}
