import {Buffer} from 'buffer';

if (typeof window === 'undefined') {
  global['crypto'] = require('crypto').webcrypto;
}

type Payload = {
  data: string,
  iv: string,
  salt?: string
}

export class Encryptor<T> {

  static create<T>() {
    return new Encryptor<T>();
  }

  encrypt (password: string, data: T): Promise<string> {
    const salt = this.generateSalt();

    return this.keyFromPassword(password, salt)
      .then( (passwordDerivedKey) => {
        return this.encryptWithKey(passwordDerivedKey, data)
      })
      .then( (payload) => {
        payload.salt = salt
        return JSON.stringify(payload);
      })
  }

  decrypt (password: string, text: string | Payload): Promise<T> {
    const payload = typeof(text) === 'string' ? JSON.parse(text) as Payload : text;
    const salt = payload.salt;
    return this.keyFromPassword(password, salt)
      .then( (key) => {
        return this.decryptWithKey(key, payload)
      })
  }

  private encryptWithKey (key: CryptoKey, data: T): Promise<Payload> {
    const text = JSON.stringify(data);
    const dataBuffer = Buffer.from(text, 'utf8');
    const vector = crypto.getRandomValues(new Uint8Array(16))
    return crypto.subtle.encrypt({
      name: 'AES-GCM',
      iv: vector,
    }, key, dataBuffer).then(function (buf) {
      const buffer = new Uint8Array(buf)
      const vectorStr = Buffer.from(vector).toString('hex')
      const vaultStr = Buffer.from(buffer).toString('hex')
      return {
        data: vaultStr,
        iv: vectorStr
      }
    })
  }

  private decryptWithKey (key: CryptoKey, payload: Payload) {
    const encryptedData = Buffer.from(payload.data,'hex');
    const vector = Buffer.from(payload.iv, 'hex');
    return crypto.subtle.decrypt({name: 'AES-GCM', iv: vector}, key, encryptedData)
      .then( (result) => {
        const decryptedData = new Uint8Array(result)
        const decryptedStr = Buffer.from(decryptedData).toString('utf8');
        return JSON.parse(decryptedStr)
      })
      .catch( (reason) => {
        throw new Error('Incorrect password')
      })
  }

  private keyFromPassword (password: string, salt: string) {
    const passBuffer = Buffer.from(password, 'utf8');
    const saltBuffer = Buffer.from(salt, 'hex');

    return crypto.subtle.importKey(
      'raw',
      passBuffer,
      {name: 'PBKDF2'},
      false,
      ['deriveBits', 'deriveKey']
    ).then( (key) => {

      return crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: saltBuffer,
          iterations: 10000,
          hash: 'SHA-256',
        },
        key,
        {name: 'AES-GCM', length: 256},
        false,
        ['encrypt', 'decrypt']
      )
    })
  }

  private serializeBufferFromStorage (str: string) {
    var stripStr = (str.slice(0, 2) === '0x') ? str.slice(2) : str
    var buf = new Uint8Array(stripStr.length / 2)
    for (let i = 0; i < stripStr.length; i += 2) {
      var seg = stripStr.substr(i, 2)
      buf[i / 2] = parseInt(seg, 16)
    }
    return buf
  }

  private serializeBufferForStorage (buffer: Buffer) {
    var result = '0x'
    var len = buffer.length || buffer.byteLength
    for (let i = 0; i < len; i++) {
      result += this.unprefixedHex(buffer[i])
    }
    return result
  }

  private unprefixedHex (num: number) {
    let hex = num.toString(16)
    while (hex.length < 2) {
      hex = '0' + hex
    }
    return hex
  }

  private generateSalt (byteCount = 32) {
    const view = new Uint8Array(byteCount);
    crypto.getRandomValues(view);
    return Buffer.from(view).toString('hex');
  }

}
