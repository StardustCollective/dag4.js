import {isValidAddress} from 'ethereumjs-util/dist/account';
import {IKeyringAccount, KeyringAssetType, KeyringNetwork} from '../kcs';
import {EcdsaAccount} from './ecdsa-account';
import * as sigUtil from 'eth-sig-util';
import * as ethUtil from 'ethereumjs-util';

/**
 * Ethereum account implementation.
 * Extends EcdsaAccount to provide Ethereum-specific functionality.
 */
export class EthAccount extends EcdsaAccount implements IKeyringAccount {

  /**
   * Number of decimal places for the native asset (ETH).
   */
  decimals = 18;

  /**
   * The network this account belongs to.
   */
  network = KeyringNetwork.Ethereum;

  /**
   * Whether this account supports tokens.
   */
  hasTokenSupport = true;

  /**
   * The types of assets supported by this account.
   */
  supportedAssets = [KeyringAssetType.ETH,KeyringAssetType.ERC20];

  /**
   * List of token addresses associated with this account.
   */
  tokens = ['0xa393473d64d2F9F026B60b6Df7859A689715d092']; //LTX

  /**
   * Saves a token address to the account's token list.
   * @param address - The token address to save
   */
  saveTokenInfo (address: string) {
    if(this.tokens.indexOf(address) < 0) {
      this.tokens.push(address)
    }
  }

  /**
   * Validates an Ethereum address.
   * @param address - The address to validate
   * @returns True if the address is valid, false otherwise
   */
  validateAddress (address: string) {
    return isValidAddress(address);
  }

  /**
   * Adds a healthy buffer of gas to an initial gas estimate.
   */
  // addGasBuffer (gas: string) {
  //   const gasBuffer = new BN('100000', 10)
  //   const bnGas = new BN(ethUtil.stripHexPrefix(gas), 16)
  //   const correct = bnGas.add(gasBuffer)
  //   return ethUtil.addHexPrefix(correct.toString(16))
  // }

  /**
   * Signs an Ethereum transaction.
   * @param tx - The transaction to sign
   * @returns The signed transaction
   */
  signTransaction (tx) {
    const privKey = this.getPrivateKeyBuffer()
    const signedTx = tx.sign(privKey)
    // Newer versions of Ethereumjs-tx are immutable and return a new tx object
    return signedTx === undefined ? tx : signedTx;
  }

  /**
   * Verifies a signed message.
   * @param msg - The original message
   * @param signature - The signature to verify
   * @param saysAddress - The address that claims to have signed the message
   * @returns True if the signature is valid, false otherwise
   */
  verifyMessage(msg: string, signature: string, saysAddress: string) {
    const publicKey = this.recoverSignedMsgPublicKey (msg, signature);
    const actualAddress = this.getAddressFromPublicKey(publicKey);
    return ethUtil.toChecksumAddress(saysAddress) === actualAddress;
  }

  /**
   * Gets the Ethereum address from a public key.
   * @param publicKey - The public key
   * @returns The checksummed Ethereum address
   */
  getAddressFromPublicKey (publicKey: string) {
    const address = '0x' + ethUtil.publicToAddress(Buffer.from(publicKey, 'hex')).toString('hex');
    return ethUtil.toChecksumAddress(address);
  }

  /**
   * Gets the encryption public key for the account.
   * @returns The encryption public key
   */
  getEncryptionPublicKey () {
    return sigUtil.getEncryptionPublicKey(this.getPrivateKey())
  }

}


