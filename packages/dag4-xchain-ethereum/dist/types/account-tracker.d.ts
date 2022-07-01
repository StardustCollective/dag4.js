export declare class AccountTracker {
    private infuraProjectId;
    private chainId;
    private isRunning;
    private accounts;
    private provider;
    private callback;
    private ethAddress;
    private debounceTimeSec;
    private timeoutId;
    private lastBlock;
    constructor({ infuraCreds }: {
        infuraCreds: any;
    });
    config(ethAddress: string, accounts: TokenInfo[], chainId: number, callback: (e: string, t: TokenBalances) => void, debounceTimeSec?: number): void;
    private start;
    private runInterval;
    private stop;
    private getTokenBalances;
}
declare type TokenBalances = {
    [address: string]: string;
};
declare type TokenInfo = {
    "contractAddress": string;
    "decimals": number;
    "balance"?: string;
};
export {};
