

const encryptor = new dag4.Encryptor();

describe('encryptor', () => {

  it('serializeBufferForStorage', () => {

    const buf = Buffer.alloc(2);
    buf[0] = 16
    buf[1] = 1

    const output = encryptor.serializeBufferForStorage(buf)

    chai.expect('0x1001').to.equal(output)
  });

  it('serializeBufferFromStorage', () => {

    const input = '0x1001';
    const output = encryptor.serializeBufferFromStorage(input)

    chai.expect(output[0]).to.equal(16);
    chai.expect(output[1]).to.equal(1);
  })

  it('encrypt & decrypt', (done) => {

    const password = 'a sample passw0rd'
    const data = {foo: 'data to encrypt'}

    encryptor.encrypt(password, data)
        .then(function (encryptedStr) {
          chai.expect(typeof encryptedStr).to.equal('string', 'returns a string')
          return encryptor.decrypt(password, encryptedStr)
        })
        .then(function (decryptedObj) {
          chai.expect(decryptedObj).to.deep.equal(data, 'decrypted what was encrypted')
          done()
        })
        .catch(function (reason) {
          console.error(reason)
          chai.expect(typeof reason).to.equal(typeof Error, 'reason has error')
          done(reason)
        })

  })

  it('encrypt & decrypt with wrong password', (done) => {

    const password = 'a sample passw0rd';
    const wrongPassword = 'a wrong password';
    const data = {foo: 'data to encrypt'};

    encryptor.encrypt(password, data)
        .then(function (encryptedStr) {
          chai.expect(typeof encryptedStr).to.equal('string', 'returns a string')
          return encryptor.decrypt(wrongPassword, encryptedStr)
        })
        .then(function (decryptedObj) {
          chai.expect(!decryptedObj).to.equal(true, 'Wrong password should not decrypt')
          done()
        })
        .catch(function (reason) {
          done()
        })
  })

})



