import {Buffer} from 'buffer';
import * as bs58 from 'bs58';
import * as jsSha256 from "js-sha256";
import {IKeyringAccount, KeyringAssetType, KeyringNetwork} from '../kcs';
import {EcdsaAccount} from './ecdsa-account';

const BASE58_ALPHABET = /['123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+/;
const PKCS_PREFIX = '3056301006072a8648ce3d020106052b8104000a034200';

/**
 * DagAccount implementation.
 * Extends EcdsaAccount to provide Constellation-specific functionality.
 * Handles DAG-specific address formats and transaction signing.
 */
export class DagAccount extends EcdsaAccount implements IKeyringAccount {

  /**
   * Number of decimal places for DAG.
   */
  decimals = 8;

  /**
   * The network this account belongs to.
   */
  network = KeyringNetwork.Constellation;

  /**
   * Whether this account supports tokens.
   */
  hasTokenSupport = false;

  /**
   * The types of assets supported by this account.
   */
  supportedAssets = [KeyringAssetType.DAG];

  /**
   * List of token addresses associated with this account.
   */
  tokens = null;

  /**
   * Signs a Constellation transaction.
   * @param tx - The transaction to sign
   */
  signTransaction (tx) {
    // Implementation to be added
  }

  /**
   * Validates a Constellation address.
   * @param address - The address to validate
   * @returns True if the address is valid, false otherwise
   */
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

  /**
   * Gets the account's address.
   * @returns The Constellation address
   */
  getAddress (): string {
    return this.getAddressFromPublicKey(this.getPublicKey());
  }

  /**
   * Verifies a signed message.
   * @param msg - The original message
   * @param signature - The signature to verify
   * @param saysAddress - The address that claims to have signed the message
   * @returns True if the signature is valid, false otherwise
   */
  verifyMessage(msg: string, signature: string, saysAddress: string) {
    const publicKey = this.recoverSignedMsgPublicKey(msg, signature);
    const actualAddress = this.getAddressFromPublicKey(publicKey);
    return saysAddress === actualAddress;
  }

  /**
   * Computes the SHA-256 hash of the input.
   * @param hash - The input to hash (string or Buffer)
   * @returns The SHA-256 hash as a hex string
   */
  private sha256 (hash: string | Buffer) {
    return jsSha256.sha256(hash);
  }

  /**
   * Derives a Constellation address from a public key.
   * @param publicKeyHex - The public key in hex format
   * @returns The derived Constellation address
   */
  private getAddressFromPublicKey (publicKeyHex: string) {
    //PKCS standard requires a prefix '04' for an uncompressed Public Key
    // An uncompressed public key is a 64-byte number; in hex this gives a string length of 128
    // Check to see if prefix is missing
    if (publicKeyHex.length === 128) {
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
