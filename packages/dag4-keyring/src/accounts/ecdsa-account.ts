import Wallet from 'ethereumjs-wallet';
import {Buffer} from 'buffer';
import * as ethUtil from 'ethereumjs-util';

import {
  KeyringAccountSerialized,
  KeyringAccountState,
  KeyringAssetType,
  KeyringNetwork
} from '../kcs';
import {Asset} from './asset';
import {Web3Provider} from "../web3/Web3Provider";


export abstract class EcdsaAccount {

  protected tokens: string[];

  protected wallet: Wallet;// = Wallet.generate();
  protected assets: Asset[];
  protected bip44Index: number;

  abstract decimals: number;
  abstract network: KeyringNetwork;
  abstract hasTokenSupport: boolean;
  abstract supportedAssets: KeyringAssetType[];
  private provider: Web3Provider;
  private label: string;

  abstract verifyMessage(msg: string, signature: string, saysAddress: string): boolean;

  getDecimals() {
    return this.decimals;
  }

  getLabel(): string {
    return this.label;
  }

  create (privateKey: string) {
    this.wallet = privateKey ? Wallet.fromPrivateKey(Buffer.from(privateKey, 'hex')) : Wallet.generate();
    return this;
  }

  saveTokenInfo (address: string) {

  }

  getWeb3Provider (): Web3Provider {
    return this.provider;
  }

  setWeb3Provider (provider: Web3Provider) {
    this.provider = provider;
  }

  getTokens (): string[] {
    return this.tokens && this.tokens.concat();
  }

  setTokens (tokens: string[]) {
    if (tokens) {
      this.tokens = tokens.concat();
    }
  }

  getBip44Index (): number {
    return this.bip44Index;
  }

  getState (): KeyringAccountState {
    const result:KeyringAccountState = {
      address: this.getAddress(),
      supportedAssets: this.supportedAssets
    }
    if (this.label) {
      result.label = this.label;
    }
    if (this.tokens) {
      result.tokens = this.tokens;
    }
    return result;
  }

  getNetwork (): KeyringNetwork {
    return this.network;
  }

  serialize (includePrivateKey = true): KeyringAccountSerialized {
    const result:KeyringAccountSerialized = {}
    if (includePrivateKey) result.privateKey = this.getPrivateKey();
    if (this.label) result.label = this.label;
    if (this.tokens) result.tokens = this.tokens.concat();
    if (this.bip44Index >= 0) result.bip44Index = this.bip44Index;
    return result;
  }

  deserialize ({privateKey, publicKey, tokens, bip44Index, label}: KeyringAccountSerialized) {

    if (privateKey) {
      this.wallet = Wallet.fromPrivateKey(Buffer.from(privateKey, 'hex'));
    }
    else {
      this.wallet = Wallet.fromPublicKey(Buffer.from(publicKey, 'hex'));
    }

    this.label = label;
    this.bip44Index = bip44Index;
    this.tokens = tokens || this.tokens;
    return this;
  }

  signMessage(msg: string) {
    const privateKey = this.getPrivateKeyBuffer();
    const msgHash = ethUtil.hashPersonalMessage(Buffer.from(msg));

    const { v, r, s } = ethUtil.ecsign(msgHash, privateKey);

    if (!ethUtil.isValidSignature(v, r, s)) {
      throw new Error('Sign-Verify failed');
    }

    return ethUtil.stripHexPrefix(ethUtil.toRpcSig(v, r, s));
  }

  recoverSignedMsgPublicKey(msg: string, signature: string) {

    const msgHash = ethUtil.hashPersonalMessage(Buffer.from(msg));
    const signatureParams = ethUtil.fromRpcSig('0x' + signature);
    const publicKeyBuffer = ethUtil.ecrecover(
      msgHash,
      signatureParams.v,
      signatureParams.r,
      signatureParams.s
    );

    return publicKeyBuffer.toString('hex');
  }

  getAddress (): string {
    return this.wallet.getChecksumAddressString();
  }

  getPublicKey () {
    return this.wallet.getPublicKey().toString('hex');
  }

  getPrivateKey () {
    return this.wallet.getPrivateKey().toString('hex');
  }

  protected getPrivateKeyBuffer () {
    return this.wallet.getPrivateKey();
  }
}
