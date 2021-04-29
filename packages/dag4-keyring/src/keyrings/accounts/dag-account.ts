import * as ethUtil from 'ethereumjs-util';
import {ECDSASignatureBuffer} from 'ethereumjs-util/dist/signature';
import {Buffer} from 'buffer';
import * as sigUtil from 'eth-sig-util';
import {IKeyringAccount} from '../keyring-account';
import {keyringRegistry} from '../keyring-registry';
import {KeyringChainId} from '../kcs';
import {EcdsaAccount} from './ecdsa-account';

const BASE58_ALPHABET = /['123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+/;

export class DagAccount extends EcdsaAccount implements IKeyringAccount {


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




}

keyringRegistry.registerAccountClass(KeyringChainId.Constellation, DagAccount);
