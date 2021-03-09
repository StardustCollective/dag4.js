import {expect} from 'chai';
import {XChainEthClient} from '../../src/client';

const PRIVATE_KEY = "114d7d51019c7f704388e03fb5c74174f27e2fc68ac88c82832ec9b1174b17fd";
const ETH_ADDRESS = "0xCb156fCC8Bcda96Fb2790a25d29824B91148d99F".toLowerCase();

describe('Client Test', () => {

  it('should get address', () => {
    const ethClient = new XChainEthClient({
      network: 'testnet',
      privateKey: PRIVATE_KEY,
    })
    expect(ethClient.getAddress()).equal(ETH_ADDRESS)
  })
});
