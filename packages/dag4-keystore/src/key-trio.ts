/**
 * A class representing a trio of cryptographic keys and their associated address.
 * This class is used to group together the private key, public key, and address
 * that are generated during key pair creation.
 */
export class KeyTrio {
  /**
   * Creates a new KeyTrio instance.
   * @param privateKey - The private key in hexadecimal format
   * @param publicKey - The public key in hexadecimal format
   * @param address - The address derived from the public key
   */
  constructor (public privateKey: string, public publicKey: string, public address: string) {}
}
