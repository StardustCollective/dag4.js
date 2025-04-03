import {Buffer} from 'buffer';

if (typeof window === 'undefined' && !global.crypto) {
  global['crypto'] = require('crypto').webcrypto;
}

/**
 * Type representing the encrypted payload structure.
 */
type Payload = {
  data: string,
  iv: string,
  salt?: string
}

/**
 * Generic class for encrypting and decrypting data.
 * Uses the Web Crypto API for secure encryption operations.
 * @template T - The type of data to encrypt/decrypt
 */
export class Encryptor<T> {

  /**
   * Creates a new instance of the Encryptor class.
   * @template T - The type of data to encrypt/decrypt
   * @returns A new Encryptor instance
   */
  static create<T>() {
    return new Encryptor<T>();
  }

  /**
   * Encrypts data using a password.
   * @param password - The password to derive the encryption key from
   * @param data - The data to encrypt
   * @returns A promise that resolves to the encrypted data as a JSON string
   */
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

  /**
   * Decrypts data using a password.
   * @param password - The password to derive the decryption key from
   * @param text - The encrypted data as a JSON string or Payload object
   * @returns A promise that resolves to the decrypted data
   */
  decrypt (password: string, text: string | Payload): Promise<T> {
    const payload = typeof(text) === 'string' ? JSON.parse(text) as Payload : text;
    const salt = payload.salt;
    return this.keyFromPassword(password, salt)
      .then( (key) => {
        return this.decryptWithKey(key, payload)
      })
  }

  /**
   * Encrypts data using a derived key.
   * @param key - The encryption key
   * @param data - The data to encrypt
   * @returns A promise that resolves to the encrypted payload
   */
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

  /**
   * Decrypts data using a derived key.
   * @param key - The decryption key
   * @param payload - The encrypted payload
   * @returns A promise that resolves to the decrypted data
   * @throws Error if the password is incorrect
   */
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

  /**
   * Derives a key from a password and salt using PBKDF2.
   * @param password - The password
   * @param salt - The salt
   * @returns A promise that resolves to the derived key
   */
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

  /**
   * Serializes a buffer for storage.
   * @param str - The string to serialize
   * @returns The serialized buffer
   */
  private serializeBufferFromStorage (str: string) {
    var stripStr = (str.slice(0, 2) === '0x') ? str.slice(2) : str
    var buf = new Uint8Array(stripStr.length / 2)
    for (let i = 0; i < stripStr.length; i += 2) {
      var seg = stripStr.substr(i, 2)
      buf[i / 2] = parseInt(seg, 16)
    }
    return buf
  }

  /**
   * Serializes a buffer for storage.
   * @param buffer - The buffer to serialize
   * @returns The serialized string
   */
  private serializeBufferForStorage (buffer: Buffer) {
    var result = '0x'
    var len = buffer.length || buffer.byteLength
    for (let i = 0; i < len; i++) {
      result += this.unprefixedHex(buffer[i])
    }
    return result
  }

  /**
   * Converts a number to an unprefixed hex string.
   * @param num - The number to convert
   * @returns The hex string
   */
  private unprefixedHex (num: number) {
    let hex = num.toString(16)
    while (hex.length < 2) {
      hex = '0' + hex
    }
    return hex
  }

  /**
   * Generates a random salt.
   * @param byteCount - The number of bytes for the salt (default: 32)
   * @returns The salt as a hex string
   */
  private generateSalt (byteCount = 32) {
    const view = new Uint8Array(byteCount);
    crypto.getRandomValues(view);
    return Buffer.from(view).toString('hex');
  }

}
