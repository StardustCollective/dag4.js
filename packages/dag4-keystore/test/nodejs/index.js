const dag = require("../../dist/cjs/key-store");

function test() {
    // const seed = dag.keyStore.generateSeedPhrase();
    //
    // console.log(seed);
    //
    // const key = dag.keyStore.getExtendedPrivateKeyFromMnemonic(seed);
    //
    // console.log(key);

    const phrase = "solution rookie cake shine hand attack claw awful harsh level case vocal";

    const jsonKey = dag.keyStore.encryptedPhrase(phrase, 'password');

    const phrase2 = dag.keyStore.decryptPhrase(jsonKey, 'password');

    console.log(phrase2);
}

test()
