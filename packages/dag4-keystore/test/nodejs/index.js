const dag = require("../../dist/cjs/key-store");

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

test2()
