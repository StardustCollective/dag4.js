const {txEncode} = require("../../dist/cjs/tx-encode");


const dag = require("../../dist/cjs/key-store");
const testData = require('../resources/test-data.json');

const phrase = "solution rookie cake shine hand attack claw awful harsh level case vocal";

function test() {
    // const seed = dag.keyStore.generateSeedPhrase();
    //
    // console.log(seed);
    //
    // const key = dag.keyStore.getExtendedPrivateKeyFromMnemonic(seed);
    //
    // console.log(key);

    const jsonKey = dag.keyStore.encryptPhrase(phrase, 'password');

    const phrase2 = dag.keyStore.decryptPhrase(jsonKey, 'password');

    console.log(phrase2);
}

function test2() {
    const hdkey = dag.keyStore.getMasterKeyFromMnemonic(phrase);

    for (let i=0; i < 10; i++) {
        const key = dag.keyStore.deriveAccountFromMaster(hdkey, i);

        const dagAddress = dag.keyStore.getDagAddressFromPrivateKey(key);

        const ethAddress = dag.keyStore.getEthAddressFromPrivateKey(key);

        console.log(i, ':', key, dagAddress, ethAddress);
    }

}


async function testGenerateTx () {

    const privateKey = testData.PRIVATE_KEY;
    const publicKey = dag.keyStore.getPublicKeyFromPrivate(privateKey);
    const address = dag.keyStore.getDagAddressFromPublicKey(publicKey);
    const keyTrio = { privateKey, publicKey, address };
    const tx = await dag.keyStore.generateTransaction (1234.123456789, 'DAG5A4s8whzjwz2y9VxjLQgL9bwtUjuRzvemTGFd', keyTrio, { prevHash: '', ordinal: 0 });

    //TEST remove 9th decimal precision
    console.log(JSON.stringify(tx, null, 2));
    // expect(hashReference).to.equal(HASH_REFERENCE);

    //TEST for no float-point precision rounding error
    const tx2 = await dag.keyStore.generateTransaction (145.1612903, 'DAG5A4s8whzjwz2y9VxjLQgL9bwtUjuRzvemTGFd', keyTrio, { prevHash: '', ordinal: 0 });
    console.log(JSON.stringify(tx2, null, 2));

}

async function testSameAddress () {

    const privateKey = testData.PRIVATE_KEY;
    const publicKey = dag.keyStore.getPublicKeyFromPrivate(privateKey);
    const address = dag.keyStore.getDagAddressFromPublicKey(publicKey);
    const keyTrio = { privateKey, publicKey, address };
    const tx = await dag.keyStore.generateTransaction (1234.123456789, 'DAG5WtmeekZLUS4vxCDhe9safyE6wFQ94EaczotN', keyTrio, { prevHash: '', ordinal: 0 });

    console.log(JSON.stringify(tx, null, 2));
    // expect(hashReference).to.equal(HASH_REFERENCE);

}

async function testKryo () {
    const rle = "240DAG3UTHtK5949n4tTySopeihy5iWMdaxDQQWA3WV40DAG1XspY2W52DZU1hExreJck9rdTFtAjrKjummPq75f5e1006476e6b3243f766a5f650c2bec2d3d09b3b9da017a3a6a78ec686c4e25c80497563212118e28b74fd";
    txEncode.kryoSerialize(rle);
}

testKryo()
