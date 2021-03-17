import {expect} from 'chai';
import {XChainEthClient} from '../../src/client';


const PRIVATE_KEY = "114d7d51019c7f704388e03fb5c74174f27e2fc68ac88c82832ec9b1174b17fd";
const ETH_ADDRESS = "0xCb156fCC8Bcda96Fb2790a25d29824B91148d99F".toLowerCase();

describe('Client Test', () => {

  const ethClient = new XChainEthClient({
    network: 'testnet',
    privateKey: PRIVATE_KEY,
    infuraCreds: { projectId: '8167d6b614d245239ea136e5fe3e012e' }
  })

  it('should get address', () => {
    expect(ethClient.getAddress()).equal(ETH_ADDRESS)
  })

  it('should validate address', () => {
    expect(ethClient.isValidEthereumAddress(ETH_ADDRESS)).equal(true);
    expect(ethClient.isValidEthereumAddress(ETH_ADDRESS+'1')).equal(false)
  })

  it('get token balances', async function () {

    this.timeout(10000);

    const assets = [
      { address: '0x7240ac91f01233baaf8b064248e80feaa5912ba3', symbol: 'OCTO', decimals: 18 }
    ]

    const tokens = await ethClient.getKnownTokenBalances('0xcd4328383abc5399a910b7e01c8047d95b3afa8a', assets);

    console.log(JSON.stringify(tokens, null, 2))

    expect(tokens).not.equal(null);

  })

});
