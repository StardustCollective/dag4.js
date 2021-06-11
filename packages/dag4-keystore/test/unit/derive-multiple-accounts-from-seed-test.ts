import {expect} from 'chai';
import {keyStore} from '../../src/key-store';
import Wallet from 'ethereumjs-wallet';

const phrase = "solution rookie cake shine hand attack claw awful harsh level case vocal";
const testExpect = {
  index: 5,
  key: '52754f72891614f0e3da8a716dedbaaf3f1e9e151e7475ff867838968e47d370',
  dagAddress: 'DAG27RfNfVXEtsLBt6aZf6BYQktyeB9NUX3bw7ma',
  ethAddress: '0x3d3c5ae620870cd8e708c96795d046b0c1e0f471'
}

describe('derive multiple accounts from seed', () => {

  it('Mnemonic seed phrase', async () => {

    const hdkey = keyStore.getMasterKeyFromMnemonic(phrase);

    const results = [];

    for (let i=0; i < 10; i++) {
      const key = keyStore.deriveAccountFromMaster(hdkey, i);

      const pKey = keyStore.getPublicKeyFromPrivate(key);

      const pKey2 = new Wallet(Buffer.from(key, 'hex')).getPublicKey().toString('hex')

      const dagAddress = keyStore.getDagAddressFromPrivateKey(key);

      const dagAddress2 = keyStore.getDagAddressFromPublicKey(pKey2);

      const ethAddress = keyStore.getEthAddressFromPrivateKey(key);

      console.log(i, ':', key, dagAddress, dagAddress2, ethAddress);
      console.log('   ', pKey, pKey2);

      results.push({key, dagAddress, ethAddress})
    }

    const result = results[testExpect.index];

    expect(testExpect.key).to.equal(result.key);
    expect(testExpect.dagAddress).to.equal(result.dagAddress);
    expect(testExpect.ethAddress).to.equal(result.ethAddress);
  });


});
