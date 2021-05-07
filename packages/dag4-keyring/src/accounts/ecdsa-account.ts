import Wallet from 'ethereumjs-wallet';
import {Buffer} from 'buffer';
import * as ethUtil from 'ethereumjs-util';
import {ECDSASignatureBuffer} from 'ethereumjs-util/dist/signature';
import * as sigUtil from 'eth-sig-util';
import {
  KeyringAccountSerialized,
  KeyringAccountState,
  KeyringAssetType,
  KeyringAssetInfo,
  KeyringNetwork
} from '../kcs';
import {Asset} from './asset';

//https://coders-errand.com/ecrecover-signature-verification-ethereum/
// https://arxiv.org/pdf/1508.00184.pdf#:~:text=ECDSA%20offers%20same%20level%20of%20security%20with%20smaller%20key%20sizes.&text=Data%20size%20for%20RSA%20is%20smaller%20than%20ECDSA.&text=ECDSA%20provides%20faster%20computations%20and,is%20much%20shorter%20in%20ECDSA.

// ethereumjs-tx moved
//https://github.com/ethereumjs/ethereumjs-monorepo/tree/master/packages/tx
export abstract class EcdsaAccount {

  tokens: string[];

  protected wallet: Wallet;// = Wallet.generate();
  protected assets: Asset[];

  abstract network: KeyringNetwork;
  abstract hasTokenSupport: boolean;
  abstract supportedAssets: KeyringAssetType[];

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
      supportedAssets: this.supportedAssets
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

  deserialize ({privateKey, tokens}: KeyringAccountSerialized) {
    this.wallet = Wallet.fromPrivateKey(Buffer.from(privateKey, 'hex'));
    this.tokens = tokens || this.tokens;
    return this;
  }

  signMessage (msg: string) {
    const message = ethUtil.stripHexPrefix(msg)
    const privKey = this.getPrivateKeyBuffer()
    const msgSig: ECDSASignatureBuffer = ethUtil.ecsign(Buffer.from(message, 'hex'), privKey) as any;
    if (!ethUtil.isValidSignature(msgSig.v, msgSig.r, msgSig.s)) {
      throw new Error('Sign-Verify failed');
    }
    return sigUtil.concatSig(msgSig.v, msgSig.r, msgSig.s)
  }

  getAddress (): string {
    return this.wallet.getAddressString();
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
