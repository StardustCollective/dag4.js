const { createECDH } = require('crypto');

const ecdh = createECDH('secp256k1');

class TestUtil {

  getPrivateKey () {
    return ecdh.getPrivateKey('hex');
  }
}

export const testUtil = new TestUtil();
