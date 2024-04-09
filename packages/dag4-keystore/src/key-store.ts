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
import { PostTransaction, AddressLastRef } from "./transaction";
import { PostTransactionV2, AddressLastRefV2 } from "./transaction-v2";

// Use @noble in newer env, fallback to elliptic in older env
const useFallbackLib = typeof BigInt === 'undefined';

let curve, secp;
if (useFallbackLib) {
  curve = new EC.ec("secp256k1");
} else {
  secp = require("@noble/secp256k1");
}

// coin used by ledger nano s.
const CONSTELLATION_COIN = 1137;
const ETH_WALLET_PATH = 60;

const BASE58_ALPHABET = /['123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+/;

//NOTE: During recover account from seed phrase, detect ETH accounts - inform user of derivation path and compatibility?  ETH (reuse ETH accounts) or DAG (ledger support)
const CONSTANTS = {
  BIP_44_DAG_PATH: `m/44'/${CONSTELLATION_COIN}'/0'/0`,
  BIP_44_ETH_PATH: `m/44'/${ETH_WALLET_PATH}'/0'/0`,            //MetaMask and Trezor
  //BIP_44_ETH_PATH_LEGACY: `m/44'/${ETH_WALLET_PATH}'/0'`,             //MEW, Legacy
  BIP_44_ETH_PATH_LEDGER: `m/44'/${ETH_WALLET_PATH}'`,                //Ledger Live
  PKCS_PREFIX: '3056301006072a8648ce3d020106052b8104000a034200' //Removed last 2 digits. 04 is part of Public Key.
}

export enum DERIVATION_PATH {
  DAG,
  ETH,
  ETH_LEDGER
}

const DERIVATION_PATH_MAP = {
  [DERIVATION_PATH.DAG]: CONSTANTS.BIP_44_DAG_PATH,
  [DERIVATION_PATH.ETH]: CONSTANTS.BIP_44_ETH_PATH,
  [DERIVATION_PATH.ETH_LEDGER]: CONSTANTS.BIP_44_ETH_PATH_LEDGER
}

// Personal sign format `${PERSONAL_SIGN_PREFIX}${msg.length.toString()}${msg}`
export const PERSONAL_SIGN_PREFIX = `\u0019Constellation Signed Message:\n`;
export const DATA_SIGN_PREFIX = `\u0019Constellation Signed Data:\n`;

export class KeyStore {

  sha512 (hash: string | Buffer) {
    return jsSha512.sha512(hash);
  }

  sha256 (hash: string | Buffer) {
    return jsSha256.sha256(hash);
  }

  generateSeedPhrase () {
    return bip39.generateMnemonic();
  }

  generatePrivateKey (): string {
    return Wallet.generate().getPrivateKey().toString("hex")
  }

  encryptPhrase (phrase: string, password: string) {
    return V3Keystore.encryptPhrase(phrase, password);
  }

  decryptPhrase (jKey: V3Keystore<KDFParamsPhrase>, password) {
    return V3Keystore.decryptPhrase(jKey, password);
  }

  async generateEncryptedPrivateKey (password: string, privateKey?: string) {
    const wallet = privateKey ? Wallet.fromPrivateKey(Buffer.from(privateKey, "hex")) : Wallet.generate();
    const result = await wallet.toV3(password) as V3Keystore;
    return result;
  }

  async decryptPrivateKey (jKey: V3Keystore<KDFParamsPrivateKey>, password) {

    if(this.isValidJsonPrivateKey(jKey)) {
      const wallet = await Wallet.fromV3(jKey, password);
      const key = wallet.getPrivateKey().toString("hex")
      return key;
    }

    throw new Error('Invalid JSON Private Key format');
  }

  isValidJsonPrivateKey (jKey: V3Keystore<KDFParamsPrivateKey>) {

    const params = (jKey && jKey.crypto && jKey.crypto.kdfparams);

    if (params && params.salt && params.n !== undefined && params.r !== undefined && params.p !== undefined  && params.dklen !== undefined) {
      return true;
    }

    return false;
  }

  //Extended keys can be used to derive child keys
  getExtendedPrivateKeyFromMnemonic (mnemonic: string) {
    if (bip39.validateMnemonic(mnemonic)) {
      const seedBytes = bip39.mnemonicToSeedSync(mnemonic);
      const rootKey = hdkey.fromMasterSeed(seedBytes);
      return rootKey.privateExtendedKey();
    }
  }

  //Returns the first account
  getPrivateKeyFromMnemonic (mnemonic: string, derivationPath: DERIVATION_PATH = DERIVATION_PATH.DAG) {
    if (bip39.validateMnemonic(mnemonic)) {
      const seedBytes = bip39.mnemonicToSeedSync(mnemonic);

      const rootKey = hdkey.fromMasterSeed(seedBytes);
      const hardenedKey = rootKey.derivePath(DERIVATION_PATH_MAP[derivationPath]).deriveChild(0);

      return hardenedKey.getWallet().getPrivateKey().toString("hex")
    }
  }

  getMasterKeyFromMnemonic (mnemonic: string, derivationPath: DERIVATION_PATH = DERIVATION_PATH.DAG): HDKey {
    if (bip39.validateMnemonic(mnemonic)) {
      const seedBytes = bip39.mnemonicToSeedSync(mnemonic);
      const masterKey = hdkey.fromMasterSeed(seedBytes);
      return masterKey.derivePath(DERIVATION_PATH_MAP[derivationPath])
    }
  }

  deriveAccountFromMaster (masterKey: hdkey, index: number) {
    const accountKey = masterKey.deriveChild(index);
    const wallet = accountKey.getWallet();
    return wallet.getPrivateKey().toString("hex")
  }

  async sign (privateKey: string, msg: string) {
    const sha512Hash = this.sha512(msg);

    if (useFallbackLib) {
      const ecSig = curve.sign(sha512Hash, Buffer.from(privateKey, 'hex'));//, {canonical: true});
      return Buffer.from(ecSig.toDER()).toString('hex');
    }

    const sig = await secp.sign(sha512Hash, privateKey);
    return Buffer.from(sig).toString('hex');
  }

  async personalSign (privateKey: string, msg: string) {
    const message = `${PERSONAL_SIGN_PREFIX}${msg.length.toString()}\n${msg}`;
    return this.sign(privateKey, message);
  }

  serialize(msg: string): string {
    return Buffer.from(msg, "utf-8").toString("hex");
  }

  async dataSign(privateKey: string, msg: string) {
    const message = `${DATA_SIGN_PREFIX}${msg.length.toString()}\n${msg}`;
    const serializedMessage = this.serialize(message);
    const hash = this.sha256(Buffer.from(serializedMessage, "hex"));
    return this.sign(privateKey, hash);
  }

  verify (publicKey: string, msg: string, signature: string) {
    const sha512Hash = this.sha512(msg);

    if (useFallbackLib) {
      return curve.verify(sha512Hash, signature, Buffer.from(publicKey, 'hex'));
    }

    return secp.verify(signature, sha512Hash, publicKey);
  }

  verifyData (publicKey: string, msg: string, signature: string) {
    const serializedMessage = this.serialize(msg);
    const hash = this.sha256(Buffer.from(serializedMessage, "hex"));
    const sha512Hash = this.sha512(hash);

    if (useFallbackLib) {
      return curve.verify(sha512Hash, signature, Buffer.from(publicKey, 'hex'));
    }

    return secp.verify(signature, sha512Hash, publicKey);
  }

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

  getPublicKeyFromPrivate (privateKey: string, compact = false) {
    if (useFallbackLib) {
      const point = curve.keyFromPrivate(privateKey).getPublic();

      return Buffer.from(point.encode(null, compact)).toString('hex')
    }

    return Buffer.from(secp.getPublicKey(privateKey, compact)).toString('hex');
  }

  getDagAddressFromPrivateKey (privateKeyHex: string) {
    return this.getDagAddressFromPublicKey(this.getPublicKeyFromPrivate(privateKeyHex));
  }

  getEthAddressFromPrivateKey (privateKeyHex: string) {
    const wallet = Wallet.fromPrivateKey(Buffer.from(privateKeyHex, "hex"));

    return wallet.getAddressString();
  }

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

  async generateTransaction(amount: number, toAddress: string, keyTrio: KeyTrio, lastRef: AddressLastRef, fee = 0) {
    const { transaction } = await this.generateTransactionWithHash(amount, toAddress, keyTrio, lastRef, fee);

    return transaction;
  }

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

  async generateTransactionV2 (amount: number, toAddress: string, keyTrio: KeyTrio, lastRef: AddressLastRefV2, fee = 0) {
    const { transaction } = await this.generateTransactionWithHashV2(amount, toAddress, keyTrio, lastRef, fee);

    return transaction;
  }

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

export type HDKey = EthereumHDKey;
