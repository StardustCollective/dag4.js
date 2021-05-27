import {expect} from 'chai';
import {Encryptor} from '../../src/encryptor';
import {KeyringManager} from '../../src';

const keyringManager = new KeyringManager();
const encryptor = new Encryptor();

keyringManager.setPassword('password');

// The KeyringController is also an event emitter:
keyringManager.on('newAccount', (address) => {
  console.log(`New account created: ${address}`)
})
keyringManager.on('removedAccount', (address) => {
  console.log(`account removed: ${address}`)
})

keyringManager.on('update', (state) => {
  console.log(`update`);
  console.log(JSON.stringify(state,null,2));
})

describe('encryptor', () => {

  it('encrypt & decrypt', (done) => {

    const password = 'a sample passw0rd'
    const data = {foo: 'data to encrypt'}

    encryptor.encrypt(password, data)
      .then(function (encryptedStr) {
        expect(typeof encryptedStr).to.equal('string', 'returns a string')
        console.log(encryptedStr)
        return encryptor.decrypt(password, encryptedStr)
      })
      .then(function (decryptedObj) {
        expect(decryptedObj).to.deep.equal(data, 'decrypted what was encrypted')
        done()
      })
      .catch(function (reason) {
        console.error(reason)
        expect(typeof reason).to.equal(typeof Error, 'reason has error')
        done(reason)
      })

  })

  it('encrypt & decrypt with wrong password', (done) => {

    const password = 'a sample passw0rd';
    const wrongPassword = 'a wrong password';
    const data = {foo: 'data to encrypt'};

    encryptor.encrypt(password, data)
      .then(function (encryptedStr) {
        expect(typeof encryptedStr).to.equal('string', 'returns a string')
        return encryptor.decrypt(wrongPassword, encryptedStr)
      })
      .then(function (decryptedObj) {
        expect(!decryptedObj).to.equal(true, 'Wrong password should not decrypt')
        done()
      })
      .catch(function (reason) {
        done()
      })
  })

})
