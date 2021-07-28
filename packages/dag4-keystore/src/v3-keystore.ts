import {bip39} from './bip39/bip39';
import {Buffer} from 'buffer';
import randomBytes from 'randombytes';
import uuidv4 from 'uuid/v4';
import * as blake from 'blakejs';
import * as pbkdf2_1 from 'pbkdf2';
import * as aes from 'ethereum-cryptography/aes';

const ENCRYPT = {
  cipher: 'aes-128-ctr',
  kdf: 'pbkdf2',
  prf: 'hmac-sha256',
  dklen: 32,
  c: 262144,
  hash: 'sha256'
}

const typeCheckJPhrase = (key: V3Keystore<KDFParamsPhrase>) => {

  const params = (key && key.crypto && key.crypto.kdfparams);

  if (params && params.salt && params.c !== undefined && params.dklen !== undefined) {
    return true;
  }

  throw new Error('Invalid JSON Keystore format');
}


const blake256 = (data) => {
  if (!(data instanceof Buffer)) {
    data = Buffer.from(data, 'hex');
  }
  const context = blake.blake2bInit(32, null);
  blake.blake2bUpdate(context, data);
  return Buffer.from(blake.blake2bFinal(context)).toString('hex');
};

const pbkdf2Async = async (passphrase: Buffer, salt: Buffer, iterations: number, keylen: number, digest: string) => {
  return new Promise<Buffer>((resolve, reject) => {
    pbkdf2_1.pbkdf2(passphrase, salt, iterations, keylen, digest, (err, drived) => {
      if (err) {
        reject(err)
      } else {
        resolve(drived)
      }
    })
  })
}

export class V3Keystore {

   static async encryptPhrase (phrase: string, password: string) {
    if (!bip39.validateMnemonic(phrase)) {
      throw new Error('Invalid BIP39 phrase')
    }

    const ID = uuidv4();
    const salt = randomBytes(32);
    const iv = randomBytes(16);
    const phraseBuff = Buffer.from(phrase, 'utf8');
    const kdfParams = {
      prf: ENCRYPT.prf,
      dklen: ENCRYPT.dklen,
      salt: salt.toString('hex'),
      c: ENCRYPT.c,
    }
    const cipherParams = {
      iv: iv.toString('hex'),
    }

    const derivedKey = await pbkdf2Async(Buffer.from(password), salt, kdfParams.c, kdfParams.dklen, ENCRYPT.hash);

    //encrypt(msg: Buffer, key: Buffer, iv: Buffer, mode = 'aes-128-ctr', pkcs7PaddingEnabled = true): Buffer;
    const cipherText = aes.encrypt(phraseBuff, derivedKey.slice(0, 16), iv, ENCRYPT.cipher);//.toString('hex');

    // const cipherIV = crypto.createCipheriv(cipher, derivedKey.slice(0, 16), iv)
    // const cipherText = Buffer.concat([cipherIV.update(Buffer.from(phrase, 'utf8')), cipherIV.final()])
    const mac = blake256(Buffer.concat([derivedKey.slice(16, 32), Buffer.from(cipherText)]))

    const cryptoStruct = {
      cipher: ENCRYPT.cipher,
      ciphertext: cipherText.toString('hex'),
      cipherparams: cipherParams,
      kdf: ENCRYPT.kdf,
      kdfparams: kdfParams,
      mac: mac,
    }

    const keystore = {
      crypto: cryptoStruct,
      id: ID,
      version: 1,
      meta: 'stardust-collective/dag4'
    }

    return keystore as V3Keystore<KDFParamsPhrase>;
  }

  static async decryptPhrase (keystore: V3Keystore<KDFParamsPhrase>, password: string){
    typeCheckJPhrase(keystore);

    const kdfparams = keystore.crypto.kdfparams

      const derivedKey = await pbkdf2Async(
        Buffer.from(password),
        Buffer.from(kdfparams.salt, 'hex'),
        kdfparams.c,
        kdfparams.dklen,
        ENCRYPT.hash
      )

      const ciphertext = Buffer.from(keystore.crypto.ciphertext, 'hex');
      const mac = blake256(Buffer.concat([derivedKey.slice(16, 32), ciphertext]));
      const iv = Buffer.from(keystore.crypto.cipherparams.iv, 'hex');

      if (mac !== keystore.crypto.mac) {
        return Promise.reject('invalid password')
      }

      const phrase = aes.decrypt(ciphertext, derivedKey.slice(0, 16), iv, ENCRYPT.cipher);

      return phrase.toString('utf8');
  }

}

export interface V3Keystore<T=KDFParamsPrivateKey|KDFParamsPhrase> {
  crypto: {
    cipher: string;
    cipherparams: {
      iv: string;
    };
    ciphertext: string;
    kdf: string;
    kdfparams: T;
    mac: string;
  };
  id: string;
  address?: string;
  version: number;
}

export interface KDFParamsPrivateKey {
  dklen: number;
  n: number;
  p: number;
  r: number;
  salt: string;
}

export interface KDFParamsPhrase {
  dklen: number;
  c: number;
  salt: string;
}
