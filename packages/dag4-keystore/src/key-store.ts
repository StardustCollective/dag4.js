import * as EC from "elliptic";
import EthereumHDKey from 'ethereumjs-wallet/dist/hdkey';
import { BigNumber } from "bignumber.js";
import * as jsSha256 from "js-sha256";
import * as jsSha512 from "js-sha512";
import * as bs58 from 'bs58';
import {Buffer} from 'buffer';
import Wallet, {hdkey} from 'ethereumjs-wallet';
import {KeyTrio} from './key-trio';
import {txEncode} from './tx-encode';
import {bip39} from './bip39/bip39';
import {KDFParamsPhrase, KDFParamsPrivateKey, V3Keystore} from './v3-keystore';
import { AddressLastRef } from "./transaction";
import { PostTransactionV2, AddressLastRefV2 } from "./transaction-v2";
import { normalizeObject, serializeBrotli } from "./utils";

// Use @noble in newer env, fallback to elliptic in older env
const useFallbackLib = typeof BigInt === 'undefined';

let curve, secp;
if (useFallbackLib) {
  curve = new EC.ec("secp256k1");
} else {
  secp = require("@noble/secp256k1");
}

/**
 * Coin type used by Ledger Nano S for Constellation.
 */
const CONSTELLATION_COIN = 1137;

/**
 * Coin type used for Ethereum wallets.
 */
const ETH_WALLET_PATH = 60;

/**
 * Regular expression for validating Base58 encoded strings.
 */
const BASE58_ALPHABET = /['123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+/;

/**
 * Constants for BIP-44 derivation paths and key formats.
 */
const CONSTANTS = {
  BIP_44_DAG_PATH: `m/44'/${CONSTELLATION_COIN}'/0'/0`,
  BIP_44_ETH_PATH: `m/44'/${ETH_WALLET_PATH}'/0'/0`,            //MetaMask and Trezor
  //BIP_44_ETH_PATH_LEGACY: `m/44'/${ETH_WALLET_PATH}'/0'`,             //MEW, Legacy
  BIP_44_ETH_PATH_LEDGER: `m/44'/${ETH_WALLET_PATH}'`,                //Ledger Live
  PKCS_PREFIX: '3056301006072a8648ce3d020106052b8104000a034200' //Removed last 2 digits. 04 is part of Public Key.
}

/**
 * Enum representing different derivation paths for key generation.
 */
export enum DERIVATION_PATH {
  DAG,
  ETH,
  ETH_LEDGER
}

/**
 * Map of derivation paths for different wallet types.
 */
const DERIVATION_PATH_MAP = {
  [DERIVATION_PATH.DAG]: CONSTANTS.BIP_44_DAG_PATH,
  [DERIVATION_PATH.ETH]: CONSTANTS.BIP_44_ETH_PATH,
  [DERIVATION_PATH.ETH_LEDGER]: CONSTANTS.BIP_44_ETH_PATH_LEDGER
}

/**
 * Prefix for personal message signing.
 */
export const PERSONAL_SIGN_PREFIX = `\u0019Constellation Signed Message:\n`;

/**
 * Prefix for data signing.
 */
export const DATA_SIGN_PREFIX = `\u0019Constellation Signed Data:\n`;

/**
 * A class for managing cryptographic keys and operations.
 * Provides methods for key generation, encryption, signing, and address management.
 */
export class KeyStore {

  /**
   * Computes the SHA-512 hash of the input data.
   * @param hash - The data to hash
   * @returns The hash as a hexadecimal string
   */
  sha512 (hash: string | Buffer) {
    return jsSha512.sha512(hash);
  }

  /**
   * Computes the SHA-256 hash of the input data.
   * @param hash - The data to hash
   * @returns The hash as a hexadecimal string
   */
  sha256 (hash: string | Buffer) {
    return jsSha256.sha256(hash);
  }

  /**
   * Generates a new BIP39 mnemonic phrase.
   * @returns A 12 or 24 word mnemonic phrase
   */
  generateSeedPhrase () {
    return bip39.generateMnemonic();
  }

  /**
   * Generates a new random private key.
   * @returns The private key as a hexadecimal string
   */
  generatePrivateKey (): string {
    return Wallet.generate().getPrivateKey().toString("hex")
  }

  /**
   * Encrypts a BIP39 phrase using a password.
   * @param phrase - The mnemonic phrase to encrypt
   * @param password - The password to use for encryption
   * @returns A promise that resolves to the encrypted keystore
   */
  encryptPhrase (phrase: string, password: string) {
    return V3Keystore.encryptPhrase(phrase, password);
  }

  /**
   * Decrypts a BIP39 phrase from a keystore using a password.
   * @param jKey - The keystore containing the encrypted phrase
   * @param password - The password used for encryption
   * @returns A promise that resolves to the decrypted phrase
   */
  decryptPhrase (jKey: V3Keystore<KDFParamsPhrase>, password) {
    return V3Keystore.decryptPhrase(jKey, password);
  }

  /**
   * Generates an encrypted private key from a password and optional private key.
   * @param password - The password to use for encryption
   * @param privateKey - An optional private key to encrypt
   * @returns A promise that resolves to the encrypted keystore
   */
  async generateEncryptedPrivateKey (password: string, privateKey?: string) {
    const wallet = privateKey ? Wallet.fromPrivateKey(Buffer.from(privateKey, "hex")) : Wallet.generate();
    const result = await wallet.toV3(password) as V3Keystore;
    return result;
  }

  /**
   * Decrypts a private key from a keystore using a password.
   * @param jKey - The keystore containing the encrypted private key
   * @param password - The password used for encryption
   * @returns A promise that resolves to the decrypted private key
   * @throws Error if the keystore format is invalid
   */
  async decryptPrivateKey (jKey: V3Keystore<KDFParamsPrivateKey>, password) {
    if(this.isValidJsonPrivateKey(jKey)) {
      const wallet = await Wallet.fromV3(jKey, password);
      const key = wallet.getPrivateKey().toString("hex")
      return key;
    }

    throw new Error('Invalid JSON Private Key format');
  }

  /**
   * Validates the format of a JSON private key keystore.
   * @param jKey - The keystore to validate
   * @returns True if the keystore format is valid
   */
  isValidJsonPrivateKey (jKey: V3Keystore<KDFParamsPrivateKey>) {
    const params = (jKey && jKey.crypto && jKey.crypto.kdfparams);

    if (params && params.salt && params.n !== undefined && params.r !== undefined && params.p !== undefined  && params.dklen !== undefined) {
      return true;
    }

    return false;
  }

  /**
   * Gets an extended private key from a mnemonic phrase.
   * @param mnemonic - The BIP39 mnemonic phrase
   * @returns The extended private key if the mnemonic is valid
   */
  getExtendedPrivateKeyFromMnemonic (mnemonic: string) {
    if (bip39.validateMnemonic(mnemonic)) {
      const seedBytes = bip39.mnemonicToSeedSync(mnemonic);
      const rootKey = hdkey.fromMasterSeed(seedBytes);
      return rootKey.privateExtendedKey();
    }
  }

  /**
   * Gets a private key from a mnemonic phrase using a specific derivation path.
   * @param mnemonic - The BIP39 mnemonic phrase
   * @param derivationPath - The derivation path to use (default: DAG)
   * @returns The private key if the mnemonic is valid
   */
  getPrivateKeyFromMnemonic (mnemonic: string, derivationPath: DERIVATION_PATH = DERIVATION_PATH.DAG) {
    if (bip39.validateMnemonic(mnemonic)) {
      const seedBytes = bip39.mnemonicToSeedSync(mnemonic);

      const rootKey = hdkey.fromMasterSeed(seedBytes);
      const hardenedKey = rootKey.derivePath(DERIVATION_PATH_MAP[derivationPath]).deriveChild(0);

      return hardenedKey.getWallet().getPrivateKey().toString("hex")
    }
  }

  /**
   * Gets a master key from a mnemonic phrase using a specific derivation path.
   * @param mnemonic - The BIP39 mnemonic phrase
   * @param derivationPath - The derivation path to use (default: DAG)
   * @returns The master HD key if the mnemonic is valid
   */
  getMasterKeyFromMnemonic (mnemonic: string, derivationPath: DERIVATION_PATH = DERIVATION_PATH.DAG): HDKey {
    if (bip39.validateMnemonic(mnemonic)) {
      const seedBytes = bip39.mnemonicToSeedSync(mnemonic);
      const masterKey = hdkey.fromMasterSeed(seedBytes);
      return masterKey.derivePath(DERIVATION_PATH_MAP[derivationPath])
    }
  }

  /**
   * Derives an account key from a master key at a specific index.
   * @param masterKey - The master HD key
   * @param index - The account index
   * @returns The private key for the derived account
   */
  deriveAccountFromMaster (masterKey: hdkey, index: number) {
    const accountKey = masterKey.deriveChild(index);
    const wallet = accountKey.getWallet();
    return wallet.getPrivateKey().toString("hex")
  }

  /**
   * Signs a message with a private key.
   * @param privateKey - The private key to sign with
   * @param msg - The message to sign
   * @returns A promise that resolves to the signature
   */
  async sign (privateKey: string, msg: string) {
    const sha512Hash = this.sha512(msg);

    if (useFallbackLib) {
      const ecSig = curve.sign(sha512Hash, Buffer.from(privateKey, 'hex'));//, {canonical: true});
      return Buffer.from(ecSig.toDER()).toString('hex');
    }

    const sig = await secp.sign(sha512Hash, privateKey);
    return Buffer.from(sig).toString('hex');
  }

  /**
   * Signs a message with a private key using the personal sign format.
   * @param privateKey - The private key to sign with
   * @param msg - The message to sign
   * @returns A promise that resolves to the signature
   */
  async personalSign (privateKey: string, msg: string) {
    const message = `${PERSONAL_SIGN_PREFIX}${msg.length.toString()}\n${msg}`;
    return this.sign(privateKey, message);
  }

  /**
   * Serializes a message to hexadecimal format.
   * @param msg - The message to serialize
   * @returns The serialized message
   */
  serialize(msg: string): string {
    return Buffer.from(msg, "utf-8").toString("hex");
  }

  /**
   * Signs data with a private key using the data sign format.
   * @param privateKey - The private key to sign with
   * @param msg - The data to sign
   * @returns A promise that resolves to the signature
   */
  async dataSign(privateKey: string, msg: string) {
    const message = `${DATA_SIGN_PREFIX}${msg.length.toString()}\n${msg}`;
    const serializedMessage = this.serialize(message);
    const hash = this.sha256(Buffer.from(serializedMessage, "hex"));
    return this.sign(privateKey, hash);
  }

  /**
   * Verifies a signature for a message using a public key.
   * @param publicKey - The public key to verify with
   * @param msg - The message that was signed
   * @param signature - The signature to verify
   * @returns True if the signature is valid
   */
  verify (publicKey: string, msg: string, signature: string) {
    const sha512Hash = this.sha512(msg);

    if (useFallbackLib) {
      return curve.verify(sha512Hash, signature, Buffer.from(publicKey, 'hex'));
    }

    return secp.verify(signature, sha512Hash, publicKey);
  }

  /**
   * Verifies a data signature using a public key.
   * @param publicKey - The public key to verify with
   * @param msg - The data that was signed
   * @param signature - The signature to verify
   * @returns True if the signature is valid
   */
  verifyData (publicKey: string, msg: string, signature: string) {
    const serializedMessage = this.serialize(msg);
    const hash = this.sha256(Buffer.from(serializedMessage, "hex"));
    const sha512Hash = this.sha512(hash);

    if (useFallbackLib) {
      return curve.verify(sha512Hash, signature, Buffer.from(publicKey, 'hex'));
    }

    return secp.verify(signature, sha512Hash, publicKey);
  }

  /**
   * Validates a Constellation (DAG) address format.
   * @param address - The address to validate
   * @returns True if the address format is valid
   */
  validateDagAddress (address: string) {
    if (!address) return false;

    const validLen = address.length === 40;
    const validPrefix = address.substr(0, 3) === 'DAG';
    const par = Number(address.charAt(3));
    const validParity = par >= 0 && par < 10;
    const match = BASE58_ALPHABET.exec(address.substring(4));
    const validBase58 = match && match.length > 0 && match[0].length === 36;

    return validLen && validPrefix && validParity && validBase58;
  }

  /**
   * Gets a public key from a private key.
   * @param privateKey - The private key
   * @param compact - Whether to use compact format (default: false)
   * @returns The public key as a hexadecimal string
   */
  getPublicKeyFromPrivate (privateKey: string, compact = false) {
    if (useFallbackLib) {
      const point = curve.keyFromPrivate(privateKey).getPublic();

      return Buffer.from(point.encode(null, compact)).toString('hex')
    }

    return Buffer.from(secp.getPublicKey(privateKey, compact)).toString('hex');
  }

  /**
   * Gets a Constellation (DAG) address from a private key.
   * @param privateKeyHex - The private key in hexadecimal format
   * @returns The DAG address
   */
  getDagAddressFromPrivateKey (privateKeyHex: string) {
    return this.getDagAddressFromPublicKey(this.getPublicKeyFromPrivate(privateKeyHex));
  }

  /**
   * Gets an Ethereum address from a private key.
   * @param privateKeyHex - The private key in hexadecimal format
   * @returns The Ethereum address
   */
  getEthAddressFromPrivateKey (privateKeyHex: string) {
    const wallet = Wallet.fromPrivateKey(Buffer.from(privateKeyHex, "hex"));

    return wallet.getAddressString();
  }

  /**
   * Gets a Constellation (DAG) address from a public key.
   * @param publicKeyHex - The public key in hexadecimal format
   * @returns The DAG address
   */
  getDagAddressFromPublicKey (publicKeyHex: string) {
    //PKCS standard requires a prefix '04' for an uncompressed Public Key
    // An uncompressed public key consists of a 64-byte number; 2 bytes per number in HEX is 128
    // Check to see if prefix is missing
    if (publicKeyHex.length === 128) {
      publicKeyHex = '04' + publicKeyHex;
    }

    publicKeyHex = CONSTANTS.PKCS_PREFIX + publicKeyHex;

    const sha256Str = this.sha256(Buffer.from(publicKeyHex, 'hex'));

    const bytes = Buffer.from(sha256Str, 'hex');
    const hash = bs58.encode(bytes);

    let end = hash.slice(hash.length - 36, hash.length);
    let sum = end.split('').reduce((val: number, char: any) => (isNaN(char) ? val : val + (+char)), 0);
    let par = sum % 9;

    return ('DAG' + par + end);
  }

  /**
   * Generates a transaction with a hash using a key trio and last reference.
   * @param amount - The transaction amount
   * @param toAddress - The recipient's address
   * @param keyTrio - The key trio containing private, public keys and address
   * @param lastRef - The last transaction reference
   * @param fee - The transaction fee (default: 0)
   * @returns A promise that resolves to the transaction
   */
  async generateTransactionWithHash (amount: number, toAddress: string, keyTrio: KeyTrio, lastRef: AddressLastRef, fee = 0) {
    const {address: fromAddress, publicKey, privateKey} = keyTrio;

    if (!privateKey) {
      throw new Error('No private key set');
    }

    if (!publicKey) {
      throw new Error('No public key set');
    }

    const { tx, hash } = this.prepareTx(amount, toAddress, fromAddress, lastRef, fee);

    const signature = await this.sign(privateKey, hash);

    const uncompressedPublicKey = publicKey.length === 128 ? '04' + publicKey : publicKey;

    const success = this.verify(uncompressedPublicKey, hash, signature);

    if (!success) {
      throw new Error('Sign-Verify failed');
    }

    const signatureElt: any = {};
    signatureElt.signature = signature;
    signatureElt.id = {};
    signatureElt.id.hex = uncompressedPublicKey.substring(2); //Remove 04 prefix

    tx.edge.signedObservationEdge.signatureBatch.signatures.push(signatureElt);

    return {
      hash,
      transaction: tx
    }
  }

  /**
   * Generates a transaction using a key trio and last reference.
   * @param amount - The transaction amount
   * @param toAddress - The recipient's address
   * @param keyTrio - The key trio containing private, public keys and address
   * @param lastRef - The last transaction reference
   * @param fee - The transaction fee (default: 0)
   * @returns A promise that resolves to the transaction
   */
  async generateTransaction(amount: number, toAddress: string, keyTrio: KeyTrio, lastRef: AddressLastRef, fee = 0) {
    const { transaction } = await this.generateTransactionWithHash(amount, toAddress, keyTrio, lastRef, fee);

    return transaction;
  }

  /**
   * Generates a V2 transaction with a hash using a key trio and last reference.
   * @param amount - The transaction amount
   * @param toAddress - The recipient's address
   * @param keyTrio - The key trio containing private, public keys and address
   * @param lastRef - The last transaction reference
   * @param fee - The transaction fee (default: 0)
   * @returns A promise that resolves to the V2 transaction
   */
  async generateTransactionWithHashV2 (amount: number, toAddress: string, keyTrio: KeyTrio, lastRef: AddressLastRefV2, fee = 0) {
    const {address: fromAddress, publicKey, privateKey} = keyTrio;

    if (!privateKey) {
      throw new Error('No private key set');
    }

    if (!publicKey) {
      throw new Error('No public key set');
    }

    const { tx, hash } = this.prepareTx(amount, toAddress, fromAddress, lastRef, fee, '2.0');

    const signature = await this.sign(privateKey, hash);

    const uncompressedPublicKey = publicKey.length === 128 ? '04' + publicKey : publicKey;

    const success = this.verify(uncompressedPublicKey, hash, signature);

    if (!success) {
      throw new Error('Sign-Verify failed');
    }

    const signatureElt: any = {};
    signatureElt.id = uncompressedPublicKey.substring(2); //Remove 04 prefix
    signatureElt.signature = signature;

    const transaction = txEncode.getV2TxFromPostTransaction(tx as PostTransactionV2);
    transaction.addSignature(signatureElt);

    return {
      hash,
      transaction: transaction.getPostTransaction()
    };
  }

  /**
   * Generates a Brotli signature for a body using public and private keys.
   * @param body - The body to sign
   * @param publicKey - The public key
   * @param privateKey - The private key
   * @returns A promise that resolves to the signature
   */
  async generateBrotliSignature(body: any, publicKey: string, privateKey: string) {
    const normalizedBody = normalizeObject(body);
    const serializedTx = await serializeBrotli(body);
    const messageHash = this.sha256(serializedTx);
    const signature = await this.sign(privateKey, messageHash);

    return {
      value: normalizedBody,
      proofs: [{ id: publicKey, signature }],
    };
  }

  /**
   * Generates a V2 transaction using a key trio and last reference.
   * @param amount - The transaction amount
   * @param toAddress - The recipient's address
   * @param keyTrio - The key trio containing private, public keys and address
   * @param lastRef - The last transaction reference
   * @param fee - The transaction fee (default: 0)
   * @returns A promise that resolves to the V2 transaction
   */
  async generateTransactionV2 (amount: number, toAddress: string, keyTrio: KeyTrio, lastRef: AddressLastRefV2, fee = 0) {
    const { transaction } = await this.generateTransactionWithHashV2(amount, toAddress, keyTrio, lastRef, fee);

    return transaction;
  }

  /**
   * Prepares a transaction for a specific version.
   * @param amount - The transaction amount
   * @param toAddress - The recipient's address
   * @param fromAddress - The sender's address
   * @param lastRef - The last transaction reference
   * @param fee - The transaction fee (default: 0)
   * @param version - The transaction version (default: '1.0')
   * @returns The prepared transaction
   */
  prepareTx (amount: number, toAddress: string, fromAddress: string, lastRef: AddressLastRef | AddressLastRefV2, fee = 0, version = '1.0') {
    if (toAddress === fromAddress) {
      throw new Error('KeyStore :: An address cannot send a transaction to itself');
    }

    //Normalize to integer and only preserve 8 decimals of precision
    amount = Math.floor(new BigNumber(amount).multipliedBy(1e8).toNumber());
    fee = Math.floor(new BigNumber(fee).multipliedBy(1e8).toNumber());

    if (amount < 1e-8) {
      throw new Error('KeyStore :: Send amount must be greater than 1e-8');
    }

    if (fee < 0) {
      throw new Error('KeyStore :: Send fee must be greater or equal to zero');
    }

    let tx, encodedTx;
    if (version === '1.0') {
      tx = txEncode.getTx(amount, toAddress, fromAddress, lastRef as AddressLastRef, fee);
      tx.setEncodedHashReference();
      encodedTx = tx.getEncoded(false);
    } else {
      tx = txEncode.getTxV2(amount, toAddress, fromAddress, lastRef as AddressLastRefV2, fee);
      encodedTx = tx.getEncoded();
    }

    const serializedTx = txEncode.kryoSerialize(encodedTx, version === '1.0');

    const hash = this.sha256(Buffer.from(serializedTx, 'hex'));

    if (version === '1.0') {
      tx.setSignatureBatchHash(hash);
    }

    return { 
      tx: tx.getPostTransaction(), 
      hash, 
      rle: encodedTx 
    };
  }

}

export const keyStore = new KeyStore();

/**
 * Type alias for Ethereum HD key.
 */
export type HDKey = EthereumHDKey;
