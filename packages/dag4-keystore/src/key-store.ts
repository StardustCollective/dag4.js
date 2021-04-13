import * as jsSha256 from "js-sha256";
import * as jsSha512 from "js-sha512";
import * as bs58 from 'bs58';
import {Buffer} from 'buffer';
import {KeyTrio} from './key-trio';
import {txEncode} from './tx-encode';
import {bip39} from './bip39/bip39';
import {KDFParamsPhrase, V3Keystore} from './v3-keystore';
import Wallet from 'ethereumjs-wallet'
import {hdkey} from 'ethereumjs-wallet'

import * as EC from "elliptic";
import EthereumHDKey from 'ethereumjs-wallet/dist/hdkey';
const curve = new EC.ec("secp256k1");
import { BigNumber } from "bignumber.js";

//SIZE
// elliptic - 360kb
// ethereumjs-wallet -  680kb

// coin used by ledger nano s.
const CONSTELLATION_COIN = 1137;
const ETH_WALLET_PATH = 60;

const BASE58_ALPHABET = /['123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+/;

//NOTE: During recover account from seed phrase, detect ETH accounts - inform user of derivation path and compatibility?  ETH (reuse ETH accounts) or DAG (ledger support)
const CONSTANTS = {
  BIP_44_DAG_PATH: `m/44'/${CONSTELLATION_COIN}'/0'/0/`,
  BIP_44_ETH_PATH: `m/44'/${ETH_WALLET_PATH}'/0'/0/`,
  PKCS_PREFIX: '3056301006072a8648ce3d020106052b8104000a034200' //Removed last 2 digits. 04 is part of Public Key.
}

const typeCheckJKey = (key: V3Keystore) => {

  const params = (key && key.crypto && key.crypto.kdfparams);

  if (params && params.salt && params.n !== undefined && params.r !== undefined && params.p !== undefined  && params.dklen !== undefined) {
    return true;
  }

  throw new Error('Invalid JSON Private Key format');
}

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

  async decryptPrivateKey (jKey: V3Keystore, password) {

    if(this.isValidJsonPrivateKey(jKey)) {
      const wallet = await Wallet.fromV3(jKey, password);
      const key = wallet.getPrivateKey().toString("hex")
      return key;
    }

    throw new Error('Invalid JSON Private Key format');
  }

  isValidJsonPrivateKey (jKey: V3Keystore) {

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
  getPrivateKeyFromMnemonic (mnemonic: string) {
    if (bip39.validateMnemonic(mnemonic)) {
      const seedBytes = bip39.mnemonicToSeedSync(mnemonic);

      const rootKey = hdkey.fromMasterSeed(seedBytes);
      const hardenedKey = rootKey.derivePath(CONSTANTS.BIP_44_DAG_PATH + 0);

      return hardenedKey.getWallet().getPrivateKey().toString("hex")
    }
  }

  getMasterKeyFromMnemonic (mnemonic: string): HDKey {
    if (bip39.validateMnemonic(mnemonic)) {
      const seedBytes = bip39.mnemonicToSeedSync(mnemonic);
      const masterKey = hdkey.fromMasterSeed(seedBytes);
      return masterKey;
    }
  }

  deriveAccountFromMaster (masterKey: hdkey, index: number) {
    const accountKey = masterKey.derivePath(CONSTANTS.BIP_44_DAG_PATH + index);
    const wallet = accountKey.getWallet();
    return wallet.getPrivateKey().toString("hex")
  }

  sign (privateKey: string, msg: string) {

    const sha512Hash = this.sha512(msg);

    const ecSig = curve.sign(sha512Hash, Buffer.from(privateKey, 'hex'));//, {canonical: true});
    const ecSigHex = Buffer.from(ecSig.toDER()).toString('hex');

    return ecSigHex;
  }

  verify (publicKey: string, msg: string, signature: EC.SignatureInput) {

    const sha512Hash = this.sha512(msg);

    const validSig = curve.verify(sha512Hash, signature, Buffer.from(publicKey, 'hex'));

    return validSig;
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

    const point = curve.keyFromPrivate(privateKey).getPublic();

    return Buffer.from(point.encode(null, compact)).toString('hex')
  }

  getDagAddressFromPrivateKey (privateKeyHex: string) {
    return this.getDagAddressFromPublicKey(this.getPublicKeyFromPrivate(privateKeyHex));
  }

  getEthAddressFromPrivateKey (privateKeyHex: string) {
    const wallet = Wallet.fromPrivateKey(Buffer.from(privateKeyHex, "hex"));

    return wallet.getAddressString();
  }

  //publicKeyHex should start with { 02, 03 } compressed or { 04 } uncompressed
  //  where 02 or 03 represent a compressed point (x only)
  //  while 04 represents a complete point (x,y)
  getDagAddressFromPublicKey (publicKeyHex: string) {

    const encoding = publicKeyHex.substring(0,2);

    if (encoding !== '04') {
      if (encoding === '02' || encoding === '03') {
        throw new Error('Compress public key currently not supported')
      }
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

  async generateTransaction (amount: number, toAddress: string, keyTrio: KeyTrio, lastRef: AddressLastRef, fee = 0) {

    if (toAddress === keyTrio.address) {
      throw new Error('KeyStore :: An address cannot send a transaction to itself');
    }

    if (amount <= 1e-8) {
      throw new Error('KeyStore :: The transfer amount must be greater than 1e-8');
    }

    if (fee < 0) {
      throw new Error('KeyStore :: The transfer fee cannot be a negative 1e-8');
    }

    //Normalize to integer and only preserve 8 decimals of precision
    amount = Math.floor(new BigNumber(amount).multipliedBy(1e8).toNumber());
    fee = Math.floor(new BigNumber(fee).multipliedBy(1e8).toNumber());

    const {address: fromAddress, publicKey, privateKey} = keyTrio;

    const lastRefResponse: any = txEncode.buildTx(amount, toAddress, fromAddress, publicKey, lastRef);

    if (fee > 0) {
      lastRefResponse.tx.edge.data.fee = fee;
    }

    const hashReference = txEncode.encodeTx(lastRefResponse.tx, true);

    lastRefResponse.tx.edge.observationEdge.data.hashReference = hashReference;

    const encodedTx = txEncode.encodeTx(lastRefResponse.tx, false);

    const serializedTx = txEncode.kryoSerialize(encodedTx);

    const hash = await this.sha256(Buffer.from(serializedTx, 'hex'));

    lastRefResponse.tx.edge.signedObservationEdge.signatureBatch.hash = hash;

    const signature = this.sign(privateKey, hash);

    const success = this.verify(publicKey, hash, signature);

    if (!success) {
      throw new Error('Sign-Verify failed');
    }

    const signatureElt: any = {};
    signatureElt.signature = signature;
    signatureElt.id = {};
    signatureElt.id.hex = publicKey.substring(2); //Remove 04 prefix
    lastRefResponse.tx.edge.signedObservationEdge.signatureBatch.signatures.push(signatureElt);

    return lastRefResponse.tx;
  }

}

export const keyStore = new KeyStore();

export type HDKey = EthereumHDKey;

type AddressLastRef = {
  prevHash: string,
  ordinal: number
}


