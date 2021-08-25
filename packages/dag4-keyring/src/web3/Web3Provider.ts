export interface Web3Provider {
    getTransactionCount(address: string): Promise<number>
    getBalance(address: string): Promise<BigNumberLike>
}

export type BigNumberLike = any;