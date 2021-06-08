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


export abstract class EcdsaAccount {

  tokens: string[];

  protected wallet: Wallet;// = Wallet.generate();
  protected assets: Asset[];

  abstract network: KeyringNetwork;
  abstract hasTokenSupport: boolean;
  abstract supportedAssets: KeyringAssetType[];

  abstract verifyMessage(msg: string, signature: string, saysAddress: string): boolean;

  create (privateKey: string) {
    this.wallet = privateKey ? Wallet.fromPrivateKey(Buffer.from(privateKey, 'hex')) : Wallet.generate();
    return this;
  }

  saveTokenInfo (address: string) {

  }

  getTokens (): string[] {
    return this.tokens && this.tokens.concat();
  }

  setTokens (tokens: string[]) {
    if (tokens) {
      this.tokens = tokens.concat();
    }
  }

  getState (): KeyringAccountState {
    return {
      address: this.getAddress(),
      supportedAssets: this.supportedAssets,
      tokens: this.getTokens()
    }
  }

  getNetwork (): KeyringNetwork {
    return this.network;
  }

  serialize (): KeyringAccountSerialized {
    const tokens = this.tokens ? { tokens: this.tokens.concat() } : {}
    return {
      privateKey: this.getPrivateKey(),
      ...tokens
    }
  }

  deserialize ({privateKey, publicKey, tokens}: KeyringAccountSerialized) {

    if (privateKey) {
      this.wallet = Wallet.fromPrivateKey(Buffer.from(privateKey, 'hex'));
    }
    else {
      this.wallet = Wallet.fromPublicKey(Buffer.from(publicKey, 'hex'));
    }

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
