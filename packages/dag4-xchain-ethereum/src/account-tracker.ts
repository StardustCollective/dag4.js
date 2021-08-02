import {ethers} from 'ethers';
import {tokenContractService} from './token-contract-service';
import {fromEvent, Subscription} from 'rxjs';
import {debounceTime, distinctUntilChanged} from 'rxjs/operators';

export class AccountTracker {

  private infuraProjectId: string;
  private chainId: number;
  private isRunning = false;
  private accounts: TokenInfo[];
  private provider: ethers.providers.InfuraProvider;
  private callback: (e: string, t:TokenBalances) => void;
  private ethAddress: string;
  private debounceTimeSec: number;
  private subscription: Subscription;

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

    if (accounts && accounts.length) {
      if (this.isRunning) {
        this.stop();
        this.start();
      }
      else {
        this.start();
      }
    }
    else if (this.isRunning) {
      this.stop();
    }
  }

  private start () {
    if (this.provider) {
      this.subscription.unsubscribe();
    }

    this.provider = new ethers.providers.InfuraProvider(this.chainId, this.infuraProjectId);

    this.subscription = fromEvent(this.provider, 'block')
      .pipe(
        // @ts-ignore
        debounceTime(this.debounceTimeSec * 1000),
        distinctUntilChanged()
      )
      .subscribe(num => {
        console.log('New Block: ' + num);
        this.getTokenBalances();
      });

    this.getTokenBalances();

    // this.provider.on('block', blockNumber => {
    //   console.log('New Block: ' + blockNumber);
    //   // const block = await this.provider.getBlock(blockNumber);
    //   this.getTokenBalances();
    // });

    this.isRunning = true;
  }

  private stop () {
    // this.provider.off('block');
    this.subscription.unsubscribe();
    this.subscription = null;
    this.isRunning = false;
    this.provider = null;
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
