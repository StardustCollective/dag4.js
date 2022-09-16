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
      l0Url: 'https://l0-lb-mainnet.constellationnetwork.io',
      l1Url: 'https://l1-lb-mainnet.constellationnetwork.io'
    },
    testnet: {
      beUrl: 'https://be-testnet.constellationnetwork.io',
      l0Url: 'https://l0-lb-testnet.constellationnetwork.io',
      l1Url: 'https://l1-lb-testnet.constellationnetwork.io'
    }
  }
}