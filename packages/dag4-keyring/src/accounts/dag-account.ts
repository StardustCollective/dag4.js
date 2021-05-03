import * as ethUtil from 'ethereumjs-util';
import {ECDSASignatureBuffer} from 'ethereumjs-util/dist/signature';
import {Buffer} from 'buffer';
import * as sigUtil from 'eth-sig-util';
import * as bs58 from 'bs58';
import * as jsSha256 from "js-sha256";
import {keyringRegistry} from '../keyring-registry';
import {IKeyringAccount, KeyringAssetType, KeyringNetwork} from '../kcs';
import {EcdsaAccount} from './ecdsa-account';

const BASE58_ALPHABET = /['123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+/;
const PKCS_PREFIX = '3056301006072a8648ce3d020106052b8104000a034200';

export class DagAccount extends EcdsaAccount implements IKeyringAccount {

  supportAssets = [KeyringAssetType.DAG];

  signTransaction (tx) {

  }

  validateAddress (address: string) {
    if (!address) return false;

    const validLen = address.length === 40;
    const validPrefix = address.substr(0, 3) === 'DAG';
    const par = Number(address.charAt(3));
    const validParity = par >= 0 && par < 10;
    const match = BASE58_ALPHABET.exec(address.substring(4));
    const validBase58 = match && match.length > 0 && match[0].length === 36;

    return validLen && validPrefix && validParity && validBase58;
  }

  getAddress (): string {
    return this.getAddressFromPublicKey(this.getPublicKey());
  }

  private sha256 (hash: string | Buffer) {
    return jsSha256.sha256(hash);
  }

  private getAddressFromPublicKey (publicKeyHex: string) {

    const encoding = publicKeyHex.substring(0,2);

    if (encoding !== '04') {
      if (encoding === '02' || encoding === '03') {
        throw new Error('Compress public key currently not supported')
      }
      publicKeyHex = '04' + publicKeyHex;
    }

    publicKeyHex = PKCS_PREFIX + publicKeyHex;

    const sha256Str = this.sha256(Buffer.from(publicKeyHex, 'hex'));

    const bytes = Buffer.from(sha256Str, 'hex');
    const hash = bs58.encode(bytes);

    let end = hash.slice(hash.length - 36, hash.length);
    let sum = end.split('').reduce((val: number, char: any) => (isNaN(char) ? val : val + (+char)), 0);
    let par = sum % 9;

    return ('DAG' + par + end);
  }

}

keyringRegistry.registerAccountClass(KeyringNetwork.Constellation, DagAccount);
