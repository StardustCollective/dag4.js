import {isValidAddress} from 'ethereumjs-util/dist/account';
import {IKeyringAccount, KeyringAssetType, KeyringNetwork} from '../kcs';
import {EcdsaAccount} from './ecdsa-account';
import * as sigUtil from 'eth-sig-util';
import * as ethUtil from 'ethereumjs-util';

export class EthAccount extends EcdsaAccount implements IKeyringAccount {

  decimals = 18;
  network = KeyringNetwork.Ethereum;
  hasTokenSupport = true;
  supportedAssets = [KeyringAssetType.ETH,KeyringAssetType.ERC20];
  tokens = ['0xa393473d64d2F9F026B60b6Df7859A689715d092']; //LTX

  saveTokenInfo (address: string) {
    if(this.tokens.indexOf(address) < 0) {
      this.tokens.push(address)
    }
  }

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

  // tx is an instance of the (ethereumjs-tx).Transaction class.
  signTransaction (tx) {
    const privKey = this.getPrivateKeyBuffer()
    const signedTx = tx.sign(privKey)
    // Newer versions of Ethereumjs-tx are immutable and return a new tx object
    return signedTx === undefined ? tx : signedTx;
  }

  verifyMessage(msg: string, signature: string, saysAddress: string) {

    const publicKey = this.recoverSignedMsgPublicKey (msg, signature);

    const actualAddress = this.getAddressFromPublicKey(publicKey);

    return ethUtil.toChecksumAddress(saysAddress) === actualAddress;
  }

  getAddressFromPublicKey (publicKey: string) {
    const address = '0x' + ethUtil.publicToAddress(Buffer.from(publicKey, 'hex')).toString('hex');
    return ethUtil.toChecksumAddress(address);
  }

  // get public key for nacl
  getEncryptionPublicKey () {
    return sigUtil.getEncryptionPublicKey(this.getPrivateKey())
  }

}


