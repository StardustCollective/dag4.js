import {ethers} from 'ethers';
import {tokenContractService} from './token-contract-service';

export class AccountTracker {

  private infuraProjectId: string;
  private chainId: number;
  private isRunning = false;
  private accounts: TokenInfo[];
  private provider: ethers.providers.InfuraProvider;
  private callback: (e: string, t:TokenBalances) => void;
  private ethAddress: string;
  private debounceTimeSec: number;
  // private subscription: Subscription;
  private timeoutId: any;
  private lastBlock: number;

  constructor ({infuraCreds}) {
    if (infuraCreds.projectId) {
      this.infuraProjectId = infuraCreds.projectId;
    }
  }

  config (ethAddress: string, accounts: TokenInfo[], chainId = 1, callback: (e: string, t:TokenBalances) => void, debounceTimeSec = 1) {
    const changeNetwork = this.chainId !== chainId;
    this.ethAddress = ethAddress;
    this.accounts = accounts;
    this.chainId = chainId;
    this.callback = callback;
    this.debounceTimeSec = debounceTimeSec > 0.1 ? debounceTimeSec : 1

    //console.log('ethTracker.config: ', JSON.stringify(arguments));

    if (accounts && accounts.length) {
      this.start();
    }
    else if (this.isRunning) {
      this.stop();
    }
  }

  private start () {
    if (this.isRunning) {
      this.stop();
    }

    this.provider = new ethers.providers.InfuraProvider(this.chainId, this.infuraProjectId);

    this.isRunning = true;

    this.runInterval();

    // this.subscription = fromEvent(this.provider, 'block')
    //   .pipe(
    //     // @ts-ignore
    //     debounceTime(this.debounceTimeSec * 1000),
    //     distinctUntilChanged()
    //   )
    //   .subscribe(num => {
    //     console.log('New Block: ' + num);
    //     this.getTokenBalances();
    //   });
    //
    // this.getTokenBalances();

    // this.provider.on('block', blockNumber => {
    //   console.log('New Block: ' + blockNumber);
    //   // const block = await this.provider.getBlock(blockNumber);
    //   this.getTokenBalances();
    // });

  }

  private async runInterval () {
    try {
      const block = await this.provider.getBlockNumber();

      if (this.lastBlock !== block) {

        await this.getTokenBalances();

        this.lastBlock = block;
      }

      this.timeoutId = setTimeout(() => this.runInterval(), this.debounceTimeSec * 1000);
    }
    catch (e) {
      //Wait 30 seconds
      this.timeoutId = setTimeout(() => this.runInterval(), 30 * 1000);
    }
  }

  private stop () {
    // this.provider.off('block');
    // this.subscription.unsubscribe();
    // this.subscription = null;
    clearTimeout(this.timeoutId);
    this.isRunning = false;
    this.provider = null;
    this.lastBlock = null;
  }

  private async getTokenBalances () {
    // if (!this.provider) return;

    const ethBalance = await this.provider.getBalance(this.ethAddress);

    const ethBalanceNum = ethers.utils.formatEther(ethBalance) || '0';

    const tokenAddresses = this.accounts.map(t => t.contractAddress);

    const rawTokenBalances = await tokenContractService.getAddressBalances(this.provider, this.ethAddress, tokenAddresses, this.chainId);

    const tokenBalances: TokenBalances = {};

    this.accounts.forEach(t => {
      tokenBalances[t.contractAddress] = ethers.utils.formatUnits(rawTokenBalances[t.contractAddress], t.decimals) || '0';
    })

    this.callback(ethBalanceNum, tokenBalances);
  }
}

type TokenBalances = {
  [address: string]: string;
}

type TokenInfo = {
  "contractAddress": string,
  "decimals": number,
  "balance"?: string
}
