
const {XChainEthClient} = require("../../dist/cjs/client");

const PRIVATE_KEY = "114d7d51019c7f704388e03fb5c74174f27e2fc68ac88c82832ec9b1174b17fd";

async function testGetKnownTokenBalances() {


    const ethClient = new XChainEthClient({
        network: 'testnet',
        privateKey: PRIVATE_KEY,
        infuraCreds: { projectId: '8167d6b614d245239ea136e5fe3e012e' }
    });

    const assets = [
        { address: '0x7240ac91f01233baaf8b064248e80feaa5912ba3', symbol: 'OCTO', decimals: 18 }
    ]

    const tokens = await ethClient.getKnownTokenBalances('0xcd4328383abc5399a910b7e01c8047d95b3afa8a', assets);

    console.log(JSON.stringify(tokens, null, 2))

}

testGetKnownTokenBalances();
