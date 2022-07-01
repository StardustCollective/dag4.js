import { isValidAddress } from 'ethereumjs-util/dist/account';
import { KeyringAssetType, KeyringNetwork } from '../kcs';
import { EcdsaAccount } from './ecdsa-account';
import * as sigUtil from 'eth-sig-util';
import * as ethUtil from 'ethereumjs-util';
export class EthAccount extends EcdsaAccount {
    constructor() {
        super(...arguments);
        this.decimals = 18;
        this.network = KeyringNetwork.Ethereum;
        this.hasTokenSupport = true;
        this.supportedAssets = [KeyringAssetType.ETH, KeyringAssetType.ERC20];
        this.tokens = ['0xa393473d64d2F9F026B60b6Df7859A689715d092']; //LTX
    }
    saveTokenInfo(address) {
        if (this.tokens.indexOf(address) < 0) {
            this.tokens.push(address);
        }
    }
    validateAddress(address) {
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
    signTransaction(tx) {
        const privKey = this.getPrivateKeyBuffer();
        const signedTx = tx.sign(privKey);
        // Newer versions of Ethereumjs-tx are immutable and return a new tx object
        return signedTx === undefined ? tx : signedTx;
    }
    verifyMessage(msg, signature, saysAddress) {
        const publicKey = this.recoverSignedMsgPublicKey(msg, signature);
        const actualAddress = this.getAddressFromPublicKey(publicKey);
        return ethUtil.toChecksumAddress(saysAddress) === actualAddress;
    }
    getAddressFromPublicKey(publicKey) {
        const address = '0x' + ethUtil.publicToAddress(Buffer.from(publicKey, 'hex')).toString('hex');
        return ethUtil.toChecksumAddress(address);
    }
    // get public key for nacl
    getEncryptionPublicKey() {
        return sigUtil.getEncryptionPublicKey(this.getPrivateKey());
    }
}
//# sourceMappingURL=eth-account.js.map