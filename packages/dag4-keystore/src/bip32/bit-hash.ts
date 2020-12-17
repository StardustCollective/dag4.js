
import createHash from 'create-hash';
import createHmac from 'create-hmac';

export class BitHash {

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

    static dblHash256(buffer) {
        const sha256Hash = createHash('sha256').update(buffer).digest();
        return createHash('sha256').update(sha256Hash).digest();
    }

    static hmacSHA512(key, data) {
        return createHmac('sha512', key)
          .update(data)
          .digest();
    }
}
