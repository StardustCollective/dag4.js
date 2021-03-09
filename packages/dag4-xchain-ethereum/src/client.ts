import {ExplorerUrl, InfuraCreds} from '@xchainjs/xchain-ethereum';
import {Network} from '@xchainjs/xchain-client';
import {ethers} from 'ethers';
import {Client} from '@xchainjs/xchain-ethereum'

type XClientEthParams = {
  explorerUrl?: ExplorerUrl
  etherscanApiKey?: string
  infuraCreds?: InfuraCreds
  network?: Network;
  privateKey?: string;
}

export class XChainEthClient extends Client {
  constructor ({ network = 'testnet', explorerUrl, privateKey, etherscanApiKey, infuraCreds }: XClientEthParams) {
    super({ network, explorerUrl, etherscanApiKey, infuraCreds });

    this['changeWallet'](new ethers.Wallet(privateKey, this.getProvider()));
  }
}
