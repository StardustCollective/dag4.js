import { PostTransactionV2 } from "@stardust-collective/dag4-keystore";
import { DAG_DECIMALS } from "@stardust-collective/dag4-core";
import {
  PendingTx,
  TransactionReference,
  MetagraphTokenNetwork,
  MetagraphNetworkInfo,
  PendingTransaction,
} from "@stardust-collective/dag4-network";
import { BigNumber } from "bignumber.js";
import type { DagAccount } from "./dag-account";

class MetagraphTokenClient {
  private network: MetagraphTokenNetwork;

  constructor(
    private account: DagAccount,
    private networkInfo: MetagraphNetworkInfo,
    private tokenDecimals: number = DAG_DECIMALS
  ) {
    this.network = new MetagraphTokenNetwork(this.networkInfo);
  }

  get networkInstance() {
    return this.network;
  }

  get address() {
    return this.account.address;
  }

  getTransactions(limit?: number, searchAfter?: string) {
    return this.network.getTransactionsByAddress(
      this.address,
      limit,
      searchAfter
    );
  }

  async getBalance() {
    return this.getBalanceFor(this.address);
  }

  async getBalanceFor(address: string) {
    const addressObj = await this.network.getAddressBalance(address);

    if (addressObj && !isNaN(addressObj.balance)) {
      return new BigNumber(addressObj.balance)
        .multipliedBy(this.tokenDecimals)
        .toNumber();
    }

    return 0;
  }

  async getFeeRecommendation() {
    //Get last tx ref
    const lastRef = await this.network.getAddressLastAcceptedTransactionRef(
      this.address
    );

    if (!lastRef.hash) {
      return 0;
    }

    //Check for pending TX
    const lastTx = await this.network.getPendingTransaction(lastRef.hash);
    if (!lastTx) {
      return 0;
    }

    return 1 / this.tokenDecimals;
  }

  async transfer(
    toAddress: string,
    amount: number,
    fee = 0,
    autoEstimateFee = false
  ): Promise<PendingTx> {
    let normalizedAmount = Math.floor(
      new BigNumber(amount).multipliedBy(this.tokenDecimals).toNumber()
    );
    const lastRef: any =
      await this.network.getAddressLastAcceptedTransactionRef(this.address);

    if (fee === 0 && autoEstimateFee) {
      const tx = await this.network.getPendingTransaction(
        lastRef.prevHash || lastRef.hash
      );

      if (tx) {
        const addressObj = await this.network.getAddressBalance(this.address);

        //Check to see if sending max amount
        if (addressObj.balance === normalizedAmount) {
          amount -= this.tokenDecimals;
          normalizedAmount--;
        }

        fee = this.tokenDecimals;
      }
    }

    const tx = await this.account.generateSignedTransaction(
      toAddress,
      amount,
      fee,
      lastRef
    );

    if ("edge" in tx) {
      throw new Error("Unable to post v1 transaction");
    }

    const txHash = await this.network.postTransaction(tx);

    if (txHash) {
      return {
        timestamp: Date.now(),
        hash: txHash,
        amount: amount,
        receiver: toAddress,
        fee,
        sender: this.address,
        ordinal: lastRef.ordinal,
        pending: true,
        status: "POSTED",
      };
    }
  }

  async waitForBalanceChange(initialValue?: number) {
    if (initialValue === undefined) {
      initialValue = await this.getBalance();
      await this.wait(5);
    }

    let changed = false;

    //Run for a max of 2 minutes (5 * 24 times)
    for (let i = 1; i < 24; i++) {
      const result = await this.getBalance();

      if (result !== undefined) {
        if (result !== initialValue) {
          changed = true;
          break;
        }
      }

      await this.wait(5);
    }

    return changed;
  }

  private wait(time = 5): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, time * 1000));
  }

  async generateBatchTransactions(
    transfers: TransferBatchItem[],
    lastRef?: TransactionReference
  ) {
    if (!lastRef) {
      lastRef = await this.network.getAddressLastAcceptedTransactionRef(
        this.address
      );
    }

    const txns = [];
    for (const transfer of transfers) {
      const { transaction, hash } =
        await this.account.generateSignedTransactionWithHash(
          transfer.address,
          transfer.amount,
          transfer.fee,
          lastRef
        );

      lastRef = {
        hash,
        ordinal: lastRef.ordinal + 1,
      };

      txns.push(transaction);
    }

    return txns;
  }

  async sendBatchTransactions(transactions: PostTransactionV2[]) {
    const hashes = [];
    for (const txn of transactions) {
      const hash = await this.network.postTransaction(txn);

      hashes.push(hash);
    }

    return hashes;
  }

  async transferBatch(
    transfers: TransferBatchItem[],
    lastRef?: TransactionReference
  ) {
    const txns = await this.generateBatchTransactions(transfers, lastRef);

    return this.sendBatchTransactions(txns);
  }
}

type TransferBatchItem = {
  address: string;
  amount: number;
  fee?: number;
};

export { MetagraphTokenClient };
