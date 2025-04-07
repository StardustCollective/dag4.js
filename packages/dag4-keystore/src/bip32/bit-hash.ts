import createHash from 'create-hash';
import createHmac from 'create-hmac';

/**
 * A utility class for cryptographic hash operations.
 * Provides methods for common hashing operations used in BIP32.
 */
export class BitHash {

    /**
     * Computes a hash160 (RIPEMD160(SHA256)) of the input buffer.
     * @param buffer - The input buffer to hash
     * @returns The resulting hash as a buffer
     */
    static hash160(buffer) {
        const sha256Hash = createHash('sha256')
          .update(buffer)
          .digest();
        try {
            return createHash('rmd160')
              .update(sha256Hash)
              .digest();
        }
        catch (err) {
            return createHash('ripemd160')
              .update(sha256Hash)
              .digest();
        }
    }

    /**
     * Computes a double SHA256 hash of the input buffer.
     * @param buffer - The input buffer to hash
     * @returns The resulting hash as a buffer
     */
    static dblHash256(buffer) {
        const sha256Hash = createHash('sha256').update(buffer).digest();
        return createHash('sha256').update(sha256Hash).digest();
    }

    /**
     * Computes an HMAC-SHA512 hash using the provided key and data.
     * @param key - The HMAC key
     * @param data - The data to hash
     * @returns The resulting hash as a buffer
     */
    static hmacSHA512(key, data) {
        return createHmac('sha512', key)
          .update(data)
          .digest();
    }
}
