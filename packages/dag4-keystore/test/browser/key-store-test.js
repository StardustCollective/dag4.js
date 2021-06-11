

const testData = loadJSON();

describe('Key Store', () => {

  it('IsValid DAG address', async () => {

    const result = dag4.keyStore.validateDagAddress(testData.DAG_ADDRESS);

    chai.expect(result).to.equal(true);
  });

  it('Public key from Private', () => {

    const result = dag4.keyStore.getPublicKeyFromPrivate(testData.PRIVATE_KEY);
    chai.expect(result).to.equal(testData.PUBLIC_KEY);

  });

  it('Compact Public key from Private', () => {

    const result = dag4.keyStore.getPublicKeyFromPrivate(testData.PRIVATE_KEY, true);
    chai.expect(result).to.equal(testData.COMPACT_PUBLIC_KEY);

  });

  it('DAG address from Public',  () => {

    const result = dag4.keyStore.getDagAddressFromPublicKey(testData.PUBLIC_KEY);
    chai.expect(result).to.equal(testData.DAG_ADDRESS);
  });

  it('Private Key from Mnemonic Seed Phrase',  () => {

    const result = dag4.keyStore.getPrivateKeyFromMnemonic(testData.SEED_PHRASE);
    chai.expect(result).to.equal(testData.SEED_PRIVATE_KEY);

    // console.log(dag4.keyStore.generateSeedPhrase());
  });
  
});

function loadJSON () {
  return {
    "PRIVATE_KEY": "114d7d51019c7f704388e03fb5c74174f27e2fc68ac88c82832ec9b1174b17fd",
    "PUBLIC_KEY": "04315d2c7182cac157d9dcc7f5fd2a4b5101df86568a4313470cbab06f672b9db302816e45218641828fef633c770079293e3db8f8a20c787f95944bbe6ea71c0a",
    "COMPACT_PUBLIC_KEY": "02315d2c7182cac157d9dcc7f5fd2a4b5101df86568a4313470cbab06f672b9db3",
    "DAG_ADDRESS": "DAG5WtmeekZLUS4vxCDhe9safyE6wFQ94EaczotN",
    "ETH_ADDRESS": "0xCb156fCC8Bcda96Fb2790a25d29824B91148d99F",
    "BTC_ADDRESS": "1JydYsDv3BQAWDr2taH7ncXyzU7BBuS946",
    "PASSPHRASE": "test1",
    "SEED_PHRASE": "yard impulse luxury drive today throw farm pepper survey wreck glass federal",
    "SEED_PRIVATE_KEY": "677c919bf7f5129c2fa245774e08f8c64be16bf6ef4d9d3fcad570c7a503d8cb",
    "JSON_PRIVATE_KEY": "5f83be83fdd3c38bdc3f383896260604f42053fd4d6591af0cf946b841bbb4b1"
  }
}


