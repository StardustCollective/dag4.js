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

/**
 * Abstract base class for ECDSA-based accounts.
 * Provides common functionality for accounts using ECDSA cryptography.
 */
export abstract class EcdsaAccount {

  /**
   * List of token addresses associated with this account.
   */
  protected tokens: string[];

  /**
   * The wallet instance managing the account's keys.
   */
  protected wallet: Wallet;

  /**
   * List of assets associated with this account.
   */
  protected assets: Asset[];

  /**
   * The BIP44 index for this account.
   */
  protected bip44Index: number;

  /**
   * Number of decimal places for the native asset.
   */
  abstract decimals: number;

  /**
   * The network this account belongs to.
   */
  abstract network: KeyringNetwork;

  /**
   * Whether this account supports tokens.
   */
  abstract hasTokenSupport: boolean;

  /**
   * The types of assets supported by this account.
   */
  abstract supportedAssets: KeyringAssetType[];

  /**
   * The Web3 provider for this account.
   */
  private provider: Web3Provider;

  /**
   * The label for this account.
   */
  private label: string;

  /**
   * Verifies a signed message.
   * @param msg - The original message
   * @param signature - The signature to verify
   * @param saysAddress - The address that claims to have signed the message
   * @returns True if the signature is valid, false otherwise
   */
  abstract verifyMessage(msg: string, signature: string, saysAddress: string): boolean;

  /**
   * Gets the number of decimal places for the native asset.
   * @returns The number of decimal places
   */
  getDecimals() {
    return this.decimals;
  }

  /**
   * Gets the account label.
   * @returns The account label
   */
  getLabel(): string {
    return this.label;
  }

  /**
   * Creates a new account with the given private key.
   * @param privateKey - The private key for the account
   * @returns The created account instance
   */
  create (privateKey: string) {
    this.wallet = privateKey ? Wallet.fromPrivateKey(Buffer.from(privateKey, 'hex')) : Wallet.generate();
    return this;
  }

  /**
   * Saves token information for the account.
   * @param address - The token address to save
   */
  saveTokenInfo (address: string) {

  }

  /**
   * Gets the Web3 provider for this account.
   * @returns The Web3 provider
   */
  getWeb3Provider (): Web3Provider {
    return this.provider;
  }

  /**
   * Sets the Web3 provider for this account.
   * @param provider - The Web3 provider to set
   */
  setWeb3Provider (provider: Web3Provider) {
    this.provider = provider;
  }

  /**
   * Gets the tokens associated with this account.
   * @returns The token addresses
   */
  getTokens (): string[] {
    return this.tokens && this.tokens.concat();
  }

  /**
   * Sets the tokens for this account.
   * @param tokens - The token addresses to set
   */
  setTokens (tokens: string[]) {
    if (tokens) {
      this.tokens = tokens.concat();
    }
  }

  /**
   * Gets the BIP44 index for this account.
   * @returns The BIP44 index
   */
  getBip44Index (): number {
    return this.bip44Index;
  }

  /**
   * Gets the current state of the account.
   * @returns The account state
   */
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

  /**
   * Gets the network this account belongs to.
   * @returns The network
   */
  getNetwork (): KeyringNetwork {
    return this.network;
  }

  /**
   * Serializes the account data.
   * @param includePrivateKey - Whether to include the private key in the serialized data
   * @returns The serialized account data
   */
  serialize (includePrivateKey = true): KeyringAccountSerialized {
    const result:KeyringAccountSerialized = {}
    if (includePrivateKey) result.privateKey = this.getPrivateKey();
    if (this.label) result.label = this.label;
    if (this.tokens) result.tokens = this.tokens.concat();
    if (this.bip44Index >= 0) result.bip44Index = this.bip44Index;
    return result;
  }

  /**
   * Deserializes account data.
   * @param data - The serialized account data
   * @returns The account instance
   */
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

  /**
   * Signs a message.
   * @param msg - The message to sign
   * @returns The signature
   */
  signMessage(msg: string) {
    const privateKey = this.getPrivateKeyBuffer();
    const msgHash = ethUtil.hashPersonalMessage(Buffer.from(msg));

    const { v, r, s } = ethUtil.ecsign(msgHash, privateKey);

    if (!ethUtil.isValidSignature(v, r, s)) {
      throw new Error('Sign-Verify failed');
    }

    return ethUtil.stripHexPrefix(ethUtil.toRpcSig(v, r, s));
  }

  /**
   * Recovers the public key from a signed message.
   * @param msg - The original message
   * @param signature - The signature
   * @returns The recovered public key
   */
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

  /**
   * Gets the account's address.
   * @returns The checksummed address
   */
  getAddress (): string {
    return this.wallet.getChecksumAddressString();
  }

  /**
   * Gets the account's public key.
   * @returns The public key as a hex string
   */
  getPublicKey () {
    return this.wallet.getPublicKey().toString('hex');
  }

  /**
   * Gets the account's private key.
   * @returns The private key as a hex string
   */
  getPrivateKey () {
    return this.wallet.getPrivateKey().toString('hex');
  }

  /**
   * Gets the account's private key as a buffer.
   * @returns The private key buffer
   */
  protected getPrivateKeyBuffer () {
    return this.wallet.getPrivateKey();
  }
}
