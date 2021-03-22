
const {XChainEthClient} = require("../../dist/cjs/client");

const PRIVATE_KEY = "114d7d51019c7f704388e03fb5c74174f27e2fc68ac88c82832ec9b1174b17fd";

const ethClient = new XChainEthClient({
    network: 'testnet',
    privateKey: PRIVATE_KEY,
    infuraCreds: { projectId: '8167d6b614d245239ea136e5fe3e012e' },

});

async function testGetKnownTokenBalances() {

    const assets = [
        { address: '0x7240ac91f01233baaf8b064248e80feaa5912ba3', symbol: 'OCTO', decimals: 18 }
    ]

    const tokens = await ethClient.getKnownTokenBalances('0xcd4328383abc5399a910b7e01c8047d95b3afa8a', assets);

    console.log(JSON.stringify(tokens, null, 2))

}

async function testGetTokenBalance() {

    const tokenInfo =
        { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', symbol: 'USDC', decimals: 6 };


    const tokens = await ethClient.getTokenBalance('0xcd4328383abc5399a910b7e01c8047d95b3afa8a', tokenInfo);

    console.log(JSON.stringify(tokens, null, 2))

}

async function testGetTokenInfo() {

    const info = await ethClient.getTokenInfo('0x875773784Af8135eA0ef43b5a374AaD105c5D39e');

    console.log(JSON.stringify(info, null, 2))
}

testGetTokenBalance();
