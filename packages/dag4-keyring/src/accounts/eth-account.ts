import * as ethSign from 'ethereumjs-util/dist/signature';
import {isValidAddress} from 'ethereumjs-util/dist/account';
import {IKeyringAccount, KeyringAssetInfo, KeyringAssetType, KeyringNetwork} from '../kcs';
import {EcdsaAccount} from './ecdsa-account';
import * as sigUtil from 'eth-sig-util';
import {ethAssetLibrary} from './eth-asset-library';
import {Buffer} from 'buffer';

export class EthAccount extends EcdsaAccount implements IKeyringAccount {

  network = KeyringNetwork.Ethereum;
  hasTokenSupport = true;
  supportedAssets = [KeyringAssetType.ETH,KeyringAssetType.ERC20];
  tokens = ethAssetLibrary.getDefaultAssets();

  saveTokenInfo (token: KeyringAssetInfo) {
    if(ethAssetLibrary.importToken(token)) {
      this.tokens.push(token.symbol)
    }
  }

  getAssetList() {
    return this.tokens.map(symbol => ethAssetLibrary.getAssetBySymbol(symbol))
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

  // For eth_sign, we need to sign arbitrary data:
  signMessage (data: string) {
    //const message = stripHexPrefix(data)
    const privKey = this.getPrivateKeyBuffer()
    const msgSig: ethSign.ECDSASignatureBuffer = ethSign.ecsign(Buffer.from(data, 'hex'), privKey) as any;
    const rawMsgSig = sigUtil.concatSig(msgSig.v, msgSig.r, msgSig.s)
    return rawMsgSig;
  }

  // For eth_sign, we need to sign transactions:
  // newGethSignMessage (msgHex) {
  //   const privKey = this.getPrivateKeyBuffer();
  //   const msgBuffer = ethUtil.toBuffer(msgHex)
  //   const msgHash = ethUtil.hashPersonalMessage(msgBuffer)
  //   const msgSig: ECDSASignatureBuffer = ethUtil.ecsign(msgHash, privKey) as any;
  //   const rawMsgSig = sigUtil.concatSig(msgSig.v, msgSig.r, msgSig.s)
  //   return rawMsgSig;
  // }
  //
  // // For personal_sign, we need to prefix the message:
  // signPersonalMessage (msgHex) {
  //   const privKeyBuffer = this.getPrivateKeyBuffer()
  //   //const privKeyBuffer = Buffer.from(privKey, 'hex')
  //   const sig = sigUtil.personalSign(privKeyBuffer, { data: msgHex })
  //   return sig;
  // }

  // For eth_decryptMessage:
  decryptMessage (encryptedData) {
    const privKey = this.getPrivateKey();//ethUtil.stripHexPrefix(wallet.getPrivateKeyBuffer())
    const sig = sigUtil.decrypt(encryptedData, privKey)
    return sig;
  }

  // personal_signTypedData, signs data along with the schema
  signTypedData (typedData, opts = { version: 'V3' }) {
    switch (opts.version) {
      case 'V1':
        return this.signTypedData_v1(typedData)
      case 'V3':
        return this.signTypedData_v3(typedData)
      case 'V4':
        return this.signTypedData_v4(typedData)
      default:
        return this.signTypedData_v1(typedData)
    }
  }

  // personal_signTypedData, signs data along with the schema
  signTypedData_v1 (typedData) {
    const privKey = this.getPrivateKeyBuffer()
    const sig = sigUtil.signTypedDataLegacy(privKey, { data: typedData })
    return sig;
  }

  // personal_signTypedData, signs data along with the schema
  signTypedData_v3 (typedData) {
    const privKey = this.getPrivateKeyBuffer()
    const sig = sigUtil.signTypedData(privKey, { data: typedData })
    return sig;
  }

  // personal_signTypedData, signs data along with the schema
  signTypedData_v4 (typedData) {
    const privKey = this.getPrivateKeyBuffer();
    const sig = sigUtil.signTypedData_v4(privKey, { data: typedData });
    return sig;
  }

  // get public key for nacl
  getEncryptionPublicKey () {
    return sigUtil.getEncryptionPublicKey(this.getPrivateKey())
  }

}


