import * as EC from "elliptic";
const curve = new EC.ec("secp256k1");
import { BigNumber } from "bignumber.js";
import * as jsSha256 from "js-sha256";
import * as jsSha512 from "js-sha512";
import * as bs58 from 'bs58';
import { Buffer } from 'buffer';
import Wallet, { hdkey } from 'ethereumjs-wallet';
import { txEncode } from './tx-encode';
import { bip39 } from './bip39/bip39';
import { V3Keystore } from './v3-keystore';
//SIZE
// elliptic - 360kb
// ethereumjs-wallet -  680kb
// coin used by ledger nano s.
const CONSTELLATION_COIN = 1137;
const ETH_WALLET_PATH = 60;
const BASE58_ALPHABET = /['123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+/;
//NOTE: During recover account from seed phrase, detect ETH accounts - inform user of derivation path and compatibility?  ETH (reuse ETH accounts) or DAG (ledger support)
const CONSTANTS = {
    BIP_44_DAG_PATH: `m/44'/${CONSTELLATION_COIN}'/0'/0`,
    BIP_44_ETH_PATH: `m/44'/${ETH_WALLET_PATH}'/0'/0`,
    //BIP_44_ETH_PATH_LEGACY: `m/44'/${ETH_WALLET_PATH}'/0'`,             //MEW, Legacy
    BIP_44_ETH_PATH_LEDGER: `m/44'/${ETH_WALLET_PATH}'`,
    PKCS_PREFIX: '3056301006072a8648ce3d020106052b8104000a034200' //Removed last 2 digits. 04 is part of Public Key.
};
export var DERIVATION_PATH;
(function (DERIVATION_PATH) {
    DERIVATION_PATH[DERIVATION_PATH["DAG"] = 0] = "DAG";
    DERIVATION_PATH[DERIVATION_PATH["ETH"] = 1] = "ETH";
    DERIVATION_PATH[DERIVATION_PATH["ETH_LEDGER"] = 2] = "ETH_LEDGER";
})(DERIVATION_PATH || (DERIVATION_PATH = {}));
const DERIVATION_PATH_MAP = {
    [DERIVATION_PATH.DAG]: CONSTANTS.BIP_44_DAG_PATH,
    [DERIVATION_PATH.ETH]: CONSTANTS.BIP_44_ETH_PATH,
    [DERIVATION_PATH.ETH_LEDGER]: CONSTANTS.BIP_44_ETH_PATH_LEDGER
};
export class KeyStore {
    sha512(hash) {
        return jsSha512.sha512(hash);
    }
    sha256(hash) {
        return jsSha256.sha256(hash);
    }
    generateSeedPhrase() {
        return bip39.generateMnemonic();
    }
    generatePrivateKey() {
        return Wallet.generate().getPrivateKey().toString("hex");
    }
    encryptPhrase(phrase, password) {
        return V3Keystore.encryptPhrase(phrase, password);
    }
    decryptPhrase(jKey, password) {
        return V3Keystore.decryptPhrase(jKey, password);
    }
    async generateEncryptedPrivateKey(password, privateKey) {
        const wallet = privateKey ? Wallet.fromPrivateKey(Buffer.from(privateKey, "hex")) : Wallet.generate();
        const result = await wallet.toV3(password);
        return result;
    }
    async decryptPrivateKey(jKey, password) {
        if (this.isValidJsonPrivateKey(jKey)) {
            const wallet = await Wallet.fromV3(jKey, password);
            const key = wallet.getPrivateKey().toString("hex");
            return key;
        }
        throw new Error('Invalid JSON Private Key format');
    }
    isValidJsonPrivateKey(jKey) {
        const params = (jKey && jKey.crypto && jKey.crypto.kdfparams);
        if (params && params.salt && params.n !== undefined && params.r !== undefined && params.p !== undefined && params.dklen !== undefined) {
            return true;
        }
        return false;
    }
    //Extended keys can be used to derive child keys
    getExtendedPrivateKeyFromMnemonic(mnemonic) {
        if (bip39.validateMnemonic(mnemonic)) {
            const seedBytes = bip39.mnemonicToSeedSync(mnemonic);
            const rootKey = hdkey.fromMasterSeed(seedBytes);
            return rootKey.privateExtendedKey();
        }
    }
    //Returns the first account
    getPrivateKeyFromMnemonic(mnemonic, derivationPath = DERIVATION_PATH.DAG) {
        if (bip39.validateMnemonic(mnemonic)) {
            const seedBytes = bip39.mnemonicToSeedSync(mnemonic);
            const rootKey = hdkey.fromMasterSeed(seedBytes);
            const hardenedKey = rootKey.derivePath(DERIVATION_PATH_MAP[derivationPath]).deriveChild(0);
            return hardenedKey.getWallet().getPrivateKey().toString("hex");
        }
    }
    getMasterKeyFromMnemonic(mnemonic, derivationPath = DERIVATION_PATH.DAG) {
        if (bip39.validateMnemonic(mnemonic)) {
            const seedBytes = bip39.mnemonicToSeedSync(mnemonic);
            const masterKey = hdkey.fromMasterSeed(seedBytes);
            return masterKey.derivePath(DERIVATION_PATH_MAP[derivationPath]);
        }
    }
    deriveAccountFromMaster(masterKey, index) {
        const accountKey = masterKey.deriveChild(index);
        const wallet = accountKey.getWallet();
        return wallet.getPrivateKey().toString("hex");
    }
    sign(privateKey, msg) {
        const sha512Hash = this.sha512(msg);
        const ecSig = curve.sign(sha512Hash, Buffer.from(privateKey, 'hex')); //, {canonical: true});
        const ecSigHex = Buffer.from(ecSig.toDER()).toString('hex');
        return ecSigHex;
    }
    verify(publicKey, msg, signature) {
        const sha512Hash = this.sha512(msg);
        const validSig = curve.verify(sha512Hash, signature, Buffer.from(publicKey, 'hex'));
        return validSig;
    }
    validateDagAddress(address) {
        if (!address)
            return false;
        const validLen = address.length === 40;
        const validPrefix = address.substr(0, 3) === 'DAG';
        const par = Number(address.charAt(3));
        const validParity = par >= 0 && par < 10;
        const match = BASE58_ALPHABET.exec(address.substring(4));
        const validBase58 = match && match.length > 0 && match[0].length === 36;
        return validLen && validPrefix && validParity && validBase58;
    }
    getPublicKeyFromPrivate(privateKey, compact = false) {
        const point = curve.keyFromPrivate(privateKey).getPublic();
        return Buffer.from(point.encode(null, compact)).toString('hex');
    }
    getDagAddressFromPrivateKey(privateKeyHex) {
        return this.getDagAddressFromPublicKey(this.getPublicKeyFromPrivate(privateKeyHex));
    }
    getEthAddressFromPrivateKey(privateKeyHex) {
        const wallet = Wallet.fromPrivateKey(Buffer.from(privateKeyHex, "hex"));
        return wallet.getAddressString();
    }
    getDagAddressFromPublicKey(publicKeyHex) {
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
        let sum = end.split('').reduce((val, char) => (isNaN(char) ? val : val + (+char)), 0);
        let par = sum % 9;
        return ('DAG' + par + end);
    }
    async generateTransaction(amount, toAddress, keyTrio, lastRef, fee = 0) {
        const { address: fromAddress, publicKey, privateKey } = keyTrio;
        if (!privateKey) {
            throw new Error('No private key set');
        }
        if (!publicKey) {
            throw new Error('No public key set');
        }
        const { tx, hash } = this.prepareTx(amount, toAddress, fromAddress, lastRef, fee);
        const signature = this.sign(privateKey, hash);
        const uncompressedPublicKey = publicKey.length === 128 ? '04' + publicKey : publicKey;
        const success = this.verify(uncompressedPublicKey, hash, signature);
        if (!success) {
            throw new Error('Sign-Verify failed');
        }
        const signatureElt = {};
        signatureElt.signature = signature;
        signatureElt.id = {};
        signatureElt.id.hex = uncompressedPublicKey.substring(2); //Remove 04 prefix
        // const transaction = txEncode.getTxFromPostTransaction(tx as PostTransaction);
        // transaction.addSignature(signatureElt);
        // return transaction.getPostTransaction();
        tx.edge.signedObservationEdge.signatureBatch.signatures.push(signatureElt);
        return tx;
    }
    async generateTransactionV2(amount, toAddress, keyTrio, lastRef, fee = 0) {
        const { address: fromAddress, publicKey, privateKey } = keyTrio;
        if (!privateKey) {
            throw new Error('No private key set');
        }
        if (!publicKey) {
            throw new Error('No public key set');
        }
        const { tx, hash } = this.prepareTx(amount, toAddress, fromAddress, lastRef, fee, '2.0');
        const signature = this.sign(privateKey, hash);
        const uncompressedPublicKey = publicKey.length === 128 ? '04' + publicKey : publicKey;
        const success = this.verify(uncompressedPublicKey, hash, signature);
        if (!success) {
            throw new Error('Sign-Verify failed');
        }
        const signatureElt = {};
        signatureElt.id = uncompressedPublicKey.substring(2); //Remove 04 prefix
        signatureElt.signature = signature;
        const transaction = txEncode.getV2TxFromPostTransaction(tx);
        transaction.addSignature(signatureElt);
        return transaction.getPostTransaction();
    }
    prepareTx(amount, toAddress, fromAddress, lastRef, fee = 0, version = '1.0') {
        if (toAddress === fromAddress) {
            throw new Error('KeyStore :: An address cannot send a transaction to itself');
        }
        //Normalize to integer and only preserve 8 decimals of precision
        amount = Math.floor(new BigNumber(amount).multipliedBy(1e8).toNumber());
        fee = Math.floor(new BigNumber(fee).multipliedBy(1e8).toNumber());
        if (amount < 1e-8) {
            console.log('amount: ', amount);
            throw new Error('KeyStore :: Send amount must be greater than 1e-8');
        }
        if (fee < 0) {
            throw new Error('KeyStore :: Send fee must be greater or equal to zero');
        }
        let tx, encodedTx;
        if (version === '1.0') {
            tx = txEncode.getTx(amount, toAddress, fromAddress, lastRef, fee);
            tx.setEncodedHashReference();
            encodedTx = tx.getEncoded(false);
        }
        else {
            tx = txEncode.getTxV2(amount, toAddress, fromAddress, lastRef, fee);
            encodedTx = tx.getEncoded();
        }
        const serializedTx = txEncode.kryoSerialize(encodedTx, version === '1.0');
        console.log('serializedTx: ', serializedTx);
        const hash = this.sha256(Buffer.from(serializedTx, 'hex'));
        console.log('hash: ', hash);
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
//# sourceMappingURL=key-store.js.map