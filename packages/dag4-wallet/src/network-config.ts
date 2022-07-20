// Default network configuration
export const networkConfig = {
  1: {
    mainnet: {
      beUrl: 'https://block-explorer.constellationnetwork.io',
      lbUrl: 'http://lb.constellationnetwork.io:9000' 
    },
    testnet: {
      beUrl: 'https://api-be.exchanges.constellationnetwork.io',
      lbUrl: 'http://lb.exchanges.constellationnetwork.io:9000'
    }
  },
  2: {
    mainnet: {
      beUrl: 'https://be-mainnet.constellationnetwork.io',
      l0Url: 'https://lb-mainnet.constellationnetwork.io:9000',
      l1Url: 'https://lb-mainnet.constellationnetwork.io:9010'
    },
    testnet: {
      beUrl: 'https://be-testnet.constellationnetwork.io',
      l0Url: 'http://lb-testnet.constellationnetwork.io:9000',
      l1Url: 'http://lb-testnet.constellationnetwork.io:9010',
    }
  }
}