"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountTracker = void 0;
const ethers_1 = require("ethers");
const token_contract_service_1 = require("./token-contract-service");
class AccountTracker {
    infuraProjectId;
    chainId;
    isRunning = false;
    accounts;
    provider;
    callback;
    ethAddress;
    debounceTimeSec;
    // private subscription: Subscription;
    timeoutId;
    lastBlock;
    constructor({ infuraCreds }) {
        if (infuraCreds.projectId) {
            this.infuraProjectId = infuraCreds.projectId;
        }
    }
    config(ethAddress, accounts, chainId = 1, callback, debounceTimeSec = 1) {
        const changeNetwork = this.chainId !== chainId;
        this.ethAddress = ethAddress;
        this.accounts = accounts;
        this.chainId = chainId;
        this.callback = callback;
        this.debounceTimeSec = debounceTimeSec > 0.1 ? debounceTimeSec : 1;
        //console.log('ethTracker.config: ', JSON.stringify(arguments));
        if (accounts && accounts.length) {
            this.start();
        }
        else if (this.isRunning) {
            this.stop();
        }
    }
    start() {
        if (this.isRunning) {
            this.stop();
        }
        this.provider = new ethers_1.ethers.providers.InfuraProvider(this.chainId, this.infuraProjectId);
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
    async runInterval() {
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
    stop() {
        // this.provider.off('block');
        // this.subscription.unsubscribe();
        // this.subscription = null;
        clearTimeout(this.timeoutId);
        this.isRunning = false;
        this.provider = null;
        this.lastBlock = null;
    }
    async getTokenBalances() {
        // if (!this.provider) return;
        const ethBalance = await this.provider.getBalance(this.ethAddress);
        const ethBalanceNum = ethers_1.ethers.utils.formatEther(ethBalance) || '0';
        const tokenAddresses = this.accounts.map(t => t.contractAddress);
        const rawTokenBalances = await token_contract_service_1.tokenContractService.getAddressBalances(this.provider, this.ethAddress, tokenAddresses, this.chainId);
        const tokenBalances = {};
        this.accounts.forEach(t => {
            tokenBalances[t.contractAddress] = ethers_1.ethers.utils.formatUnits(rawTokenBalances[t.contractAddress], t.decimals) || '0';
        });
        this.callback(ethBalanceNum, tokenBalances);
    }
}
exports.AccountTracker = AccountTracker;
//# sourceMappingURL=account-tracker.js.map