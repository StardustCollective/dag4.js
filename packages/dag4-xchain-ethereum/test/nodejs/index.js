const xchainUtil = require("@xchainjs/xchain-util");
const {getTokenAddress} = require("@xchainjs/xchain-ethereum");

const {XChainEthClient} = require("../../dist/cjs/client");
const {ethers} = require("ethers");

const PRIVATE_KEY = "114d7d51019c7f704388e03fb5c74174f27e2fc68ac88c82832ec9b1174b17fd";

const ethClient = new XChainEthClient({
    network: 'testnet',
    privateKey: PRIVATE_KEY,
    infuraCreds: { projectId: '8167d6b614d245239ea136e5fe3e012e' },

});

// async function testGetKnownTokenBalances() {
//
//     const assets = [
//         { address: '0x7240ac91f01233baaf8b064248e80feaa5912ba3', symbol: 'OCTO', decimals: 18 }
//     ]
//
//     const tokens = await ethClient.getKnownTokenBalances('0xcd4328383abc5399a910b7e01c8047d95b3afa8a', assets);
//
//     console.log(JSON.stringify(tokens, null, 2))
//
// }

async function testGetTokenBalance() {

    const tokenInfo =
        { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', symbol: 'USDC', decimals: 6 };

    const tokens = await ethClient.getTokenBalance('0xcd4328383abc5399a910b7e01c8047d95b3afa8a', tokenInfo);

    console.log(JSON.stringify(tokens, null, 2))

}

async function getEthBalance () {
    const provider = new ethers.providers.InfuraProvider();
    const result = await provider.getBalance('0x70504ae3853e42533a22BBAA96915Af95178aBe6');
    console.log(ethers.utils.formatEther(result));
}

async function testGetTokenBalanceTestnet() {

    const tokenInfo = { address: '0xeb349b537d77eec95d2761177c7581d6535630a1', symbol: 'FOO', decimals: 18 };

    const tokens = await ethClient.getTokenBalance('0xC769323999C7b5cAD4c125bE0F33e83Ee4FB25c0', tokenInfo, 3);

    console.log(JSON.stringify(tokens, null, 2))
}

async function testGetTokenInfo() {

    const info = await ethClient.getTokenInfo('0x875773784Af8135eA0ef43b5a374AaD105c5D39e');

    console.log(JSON.stringify(info, null, 2))
}

async function testXChainUtils () {

    const asset = {chain: "ETH", symbol: "LTX-0xa393473d64d2F9F026B60b6Df7859A689715d092", ticker: "LTX"};


    console.log(xchainUtil.assetToString(asset));
    console.log(getTokenAddress(asset));

}

// testXChainUtils();
// testGetTokenBalance();
// testGetTokenInfo()
getEthBalance();
