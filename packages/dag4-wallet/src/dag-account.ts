import {
  keyStore,
  KeyTrio,
  PostTransaction,
  PostTransactionV2,
} from "@stardust-collective/dag4-keystore";
import { DAG_DECIMALS } from "@stardust-collective/dag4-core";
import {
  globalDagNetwork,
  GlobalDagNetwork,
  DagNetwork,
  NetworkInfo,
  PendingTx,
  TransactionReference,
  Transaction,
  TransactionV2,
  MetagraphNetworkInfo,
} from "@stardust-collective/dag4-network";
import { BigNumber } from "bignumber.js";
import { Subject } from "rxjs";
import { networkConfig } from "./network-config";
import { MetagraphTokenClient } from "./metagraph-token-client";
import { normalizePublicKey } from "./utils";
import {
  validateWithZod,
  validateArrayWithZod,
  postAllowSpendSchema,
  postTokenLockSchema,
  postDelegatedStakeSchema,
  putWithdrawDelegatedStakeSchema,
  dagAddressValidator,
} from "./validationSchemas";

export class DagAccount {
  private m_keyTrio: KeyTrio;
  private sessionChange$ = new Subject<boolean>();
  private network: DagNetwork | GlobalDagNetwork;

  constructor(network: DagNetwork | GlobalDagNetwork) {
    this.network = network || globalDagNetwork;
  }

  connect(
    networkInfo: Omit<NetworkInfo, "id"> & { id?: string },
    useDefaultConfig = true
  ) {
    let baseConfig = {};

    if (useDefaultConfig) {
      const version = 2; // Defaults to network version 2.0
      const networkType = networkInfo.testnet ? "testnet" : "mainnet";

      baseConfig = networkConfig[version][networkType];
    }

    const networkId = networkInfo.id || "global";

    this.network.config({
      ...baseConfig,
      ...networkInfo,
      id: networkId,
    });

    return this;
  }

  get address() {
    const address = this.m_keyTrio && this.m_keyTrio.address;

    if (!address) {
      throw new Error("Need to login before calling methods on dag4.account");
    }

    return address;
  }

  get keyTrio() {
    return this.m_keyTrio;
  }

  get publicKey() {
    return this.m_keyTrio.publicKey;
  }

  get networkInstance() {
    return this.network;
  }

  loginSeedPhrase(words: string) {
    const privateKey = keyStore.getPrivateKeyFromMnemonic(words);

    this.loginPrivateKey(privateKey);
  }

  loginPrivateKey(privateKey: string) {
    const publicKey = keyStore.getPublicKeyFromPrivate(privateKey);
    const address = keyStore.getDagAddressFromPublicKey(publicKey);

    this.setKeysAndAddress(privateKey, publicKey, address);
  }

  loginPublicKey(publicKey: string) {
    const address = keyStore.getDagAddressFromPublicKey(publicKey);

    this.setKeysAndAddress("", publicKey, address);
  }

  isActive() {
    return !!this.m_keyTrio;
  }

  logout() {
    this.m_keyTrio = null;
    this.sessionChange$.next(true);
  }

  observeSessionChange() {
    return this.sessionChange$;
  }

  setKeysAndAddress(privateKey: string, publicKey: string, address: string) {
    this.m_keyTrio = new KeyTrio(privateKey, publicKey, address);
    this.sessionChange$.next(true);
  }

  getTransactions(limit?: number, searchAfter?: string) {
    return this.network.getTransactionsByAddress(
      this.address,
      limit,
      searchAfter
    );
  }

  validateDagAddress(address: string) {
    return keyStore.validateDagAddress(address);
  }

  async getBalance() {
    return this.getBalanceFor(this.address);
  }

  async getBalanceFor(address: string) {
    const addressObj = await this.network.getAddressBalance(address);

    if (addressObj && !isNaN(addressObj.balance)) {
      return new BigNumber(addressObj.balance)
        .multipliedBy(DAG_DECIMALS)
        .toNumber();
    }

    return 0;
  }

  async getFeeRecommendation() {
    //Get last tx ref
    const lastRef = (await this.network.getAddressLastAcceptedTransactionRef(
      this.address
    )) as any;

    const hash = lastRef.prevHash || lastRef.hash; // v1 vs v2 format

    if (!hash) {
      return 0;
    }

    //Check for pending TX
    const lastTx = await this.network.getPendingTransaction(hash);
    if (!lastTx) {
      return 0;
    }

    return 1 / DAG_DECIMALS;
  }

  async generateSignedTransaction(
    toAddress: string,
    amount: number,
    fee = 0,
    lastRef?
  ): Promise<PostTransaction | PostTransactionV2> {
    lastRef = lastRef
      ? lastRef
      : await this.network.getAddressLastAcceptedTransactionRef(this.address);

    if (this.network.getNetworkVersion() === "2.0") {
      return keyStore.generateTransactionV2(
        amount,
        toAddress,
        this.keyTrio,
        lastRef as any,
        fee
      );
    }

    // Support old and new lastRef format
    if (lastRef && lastRef.hash && !lastRef.prevHash) {
      lastRef.prevHash = lastRef.hash;
    }

    return keyStore.generateTransaction(
      amount,
      toAddress,
      this.keyTrio,
      lastRef as any,
      fee
    );
  }

  async generateSignedTransactionWithHash(
    toAddress: string,
    amount: number,
    fee = 0,
    lastRef?
  ): Promise<{
    transaction: PostTransaction | PostTransactionV2;
    hash: string;
  }> {
    lastRef = lastRef
      ? lastRef
      : await this.network.getAddressLastAcceptedTransactionRef(this.address);

    if (this.network.getNetworkVersion() === "2.0") {
      return keyStore.generateTransactionWithHashV2(
        amount,
        toAddress,
        this.keyTrio,
        lastRef as any,
        fee
      );
    }

    // Support old and new lastRef format
    if (lastRef && lastRef.hash && !lastRef.prevHash) {
      lastRef.prevHash = lastRef.hash;
    }

    return keyStore.generateTransactionWithHash(
      amount,
      toAddress,
      this.keyTrio,
      lastRef as any,
      fee
    );
  }

  async transferDag(
    toAddress: string,
    amount: number,
    fee = 0,
    autoEstimateFee = false
  ): Promise<PendingTx> {
    let normalizedAmount = Math.floor(
      new BigNumber(amount).multipliedBy(DAG_DECIMALS).toNumber()
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
          amount -= DAG_DECIMALS;
          normalizedAmount--;
        }

        fee = DAG_DECIMALS;
      }
    }

    const tx = await this.generateSignedTransaction(toAddress, amount, fee);
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

  async waitForCheckPointAccepted(hash: string) {
    // In V2 the txn is accepted as it's processed so we don't need to check multiple times
    if (this.network.getNetworkVersion() === "2.0") {
      let txn;
      try {
        txn = (await this.network.getPendingTransaction(hash)) as any;
      } catch (err: any) {
        // 404 NOOP
      }

      if (txn && txn.status === "Waiting") {
        return true;
      }

      try {
        await this.network.getTransaction(hash);
      } catch (err: any) {
        // 404s if not found
        return false;
      }

      return true;
    }

    let attempts = 0;
    for (let i = 1; ; i++) {
      const result = await this.network.loadBalancerApi.checkTransactionStatus(
        hash
      );

      if (result) {
        if (result.accepted) {
          break;
        }
      } else {
        attempts++;

        if (attempts > 20) {
          throw new Error("Unable to find transaction");
        }
      }

      await this.wait(2.5);
    }

    return true;
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

  // 2.0+ only
  async generateBatchTransactions(
    transfers: TransferBatchItem[],
    lastRef?: TransactionReference
  ) {
    if (this.network.getNetworkVersion() === "1.0") {
      throw new Error("transferDagBatch not available for mainnet 1.0");
    }

    if (!lastRef) {
      lastRef = (await this.network.getAddressLastAcceptedTransactionRef(
        this.address
      )) as TransactionReference;
    }

    const txns = [];
    for (const transfer of transfers) {
      const { transaction, hash } =
        await this.generateSignedTransactionWithHash(
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
    if (this.network.getNetworkVersion() === "1.0") {
      throw new Error("transferDagBatch not available for mainnet 1.0");
    }

    const hashes = [];
    for (const txn of transactions) {
      const hash = await this.network.postTransaction(txn);

      hashes.push(hash);
    }

    return hashes;
  }

  async postAllowSpend(body: {
    source: string;
    destination: string;
    approvers: string[];
    amount: number;
    fee: number;
    currencyId: string | null;
    validUntilEpoch: number;
    tokenL1Url: string;
  }) {
    const {
      source,
      destination,
      approvers,
      amount,
      fee,
      currencyId,
      validUntilEpoch,
      tokenL1Url,
    } = body;

    validateWithZod(body, postAllowSpendSchema, true);

    // Validate approvers array
    validateArrayWithZod(approvers, dagAddressValidator, true);

    if (source !== this.address) {
      throw new Error('"source" must be the same as the account address');
    }

    let allowSpendLastRef: TransactionReference | null = null;
    let signedAllowSpend: any | null = null;
    let allowSpendResponse: { hash: string } | null = null;

    try {
      // Get allow spend last reference
      allowSpendLastRef = await this.network.l1Api.getAllowSpendLastRef(
        tokenL1Url,
        this.address
      );
    } catch (err) {
      throw new Error("Error getting the allow spend last reference");
    }

    if (!allowSpendLastRef) {
      throw new Error("Unable to find allow spend last reference");
    }

    try {
      // Generate signed allow spend body
      const allowSpendBody = {
        source,
        amount,
        destination,
        approvers,
        parent: allowSpendLastRef,
        lastValidEpochProgress: validUntilEpoch,
        currencyId: currencyId ?? null,
        fee: fee ?? 0,
      };
      signedAllowSpend = await keyStore.generateBrotliSignature(
        allowSpendBody,
        normalizePublicKey(this.publicKey),
        this.m_keyTrio.privateKey
      );
    } catch (err) {
      throw new Error("Error generating the signed allow spend");
    }

    if (!signedAllowSpend) {
      throw new Error("Unable to generate signed allow spend");
    }

    try {
      // Post signed allow spend body
      allowSpendResponse = await this.network.l1Api.postAllowSpend(
        tokenL1Url,
        signedAllowSpend
      );
    } catch (err) {
      throw new Error("Error sending the allow spend transaction");
    }

    if (!allowSpendResponse) {
      throw new Error("Unable to get allow spend response");
    }

    return allowSpendResponse;
  }

  async postTokenLock(body: {
    source: string;
    amount: number;
    tokenL1Url: string;
    unlockEpoch: number | null;
    currencyId: string | null;
    fee?: number;
  }) {
    const { amount, currencyId, fee, source, tokenL1Url, unlockEpoch } = body;

    validateWithZod(body, postTokenLockSchema, true);

    if (source !== this.address) {
      throw new Error('"source" must be the same as the account address');
    }

    let tokenLockLastRef: TransactionReference | null = null;
    let signedTokenLock: any | null = null;
    let tokenLockResponse: { hash: string } | null = null;

    try {
      // Get token lock last reference
      tokenLockLastRef = await this.network.l1Api.getTokenLockLastRef(
        tokenL1Url,
        this.address
      );
    } catch (err) {
      throw new Error("Error getting the token lock last reference");
    }

    if (!tokenLockLastRef) {
      throw new Error("Unable to find token lock last reference");
    }

    try {
      // Generate signed token lock body
      const tokenLockBody = {
        source,
        amount,
        parent: tokenLockLastRef,
        currencyId: currencyId ?? null,
        fee: fee ?? 0,
        unlockEpoch: unlockEpoch ?? null,
      };
      signedTokenLock = await keyStore.generateBrotliSignature(
        tokenLockBody,
        normalizePublicKey(this.publicKey),
        this.m_keyTrio.privateKey
      );
    } catch (err) {
      throw new Error("Error generating the signed token lock");
    }

    if (!signedTokenLock) {
      throw new Error("Unable to generate signed token lock");
    }

    try {
      // Post signed token lock body
      tokenLockResponse = await this.network.l1Api.postTokenLock(
        tokenL1Url,
        signedTokenLock
      );
    } catch (err) {
      throw new Error("Error sending the token lock transaction");
    }

    if (!tokenLockResponse) {
      throw new Error("Unable to get token lock response");
    }

    return tokenLockResponse;
  }

  async postDelegatedStake(body: {
    source: string;
    nodeId: string;
    amount: number;
    fee?: number;
    tokenLockRef: string;
  }) {
    const { source, nodeId, amount, fee, tokenLockRef } = body;

    validateWithZod(body, postDelegatedStakeSchema, true);

    if (source !== this.address) {
      throw new Error('"source" must be the same as the account address');
    }

    let delegatedStakeLastRef: TransactionReference | null = null;
    let signedDelegatedStake: any | null = null;
    let delegatedStakeResponse: { hash: string } | null = null;

    try {
      // Get delegated stake last reference
      delegatedStakeLastRef = await this.network.l0Api.getDelegatedStakeLastRef(
        this.address
      );
    } catch (err) {
      throw new Error("Error getting the delegated stake last reference");
    }

    if (!delegatedStakeLastRef) {
      throw new Error("Unable to find delegated stake last reference");
    }

    try {
      // Generate signed delegated stake body
      const delegateStakeBody = {
        source,
        nodeId,
        amount,
        tokenLockRef,
        parent: delegatedStakeLastRef,
        fee: fee ?? 0,
      };
      signedDelegatedStake = await keyStore.generateBrotliSignature(
        delegateStakeBody,
        normalizePublicKey(this.publicKey),
        this.m_keyTrio.privateKey
      );
    } catch (err) {
      throw new Error("Error generating the signed delegated stake");
    }

    if (!signedDelegatedStake) {
      throw new Error("Unable to generate signed delegated stake");
    }

    try {
      // Post signed delegated stake body
      delegatedStakeResponse = await this.network.l0Api.postDelegatedStake(
        signedDelegatedStake
      );
    } catch (err) {
      throw new Error("Error sending the delegated stake transaction");
    }

    return delegatedStakeResponse;
  }

  async putWithdrawDelegatedStake(body: { source: string; stakeRef: string }) {
    const { source, stakeRef } = body;

    validateWithZod(body, putWithdrawDelegatedStakeSchema, true);

    if (source !== this.address) {
      throw new Error('"source" must be the same as the account address');
    }

    let signedWithdrawDelegatedStake: any | null = null;
    let withdrawDelegatedStakeResponse: { hash: string } | null = null;

    try {
      // Generate signed withdraw delegated stake body
      const withdrawDelegatedStakeBody = {
        source,
        stakeRef,
      };
      signedWithdrawDelegatedStake = await keyStore.generateBrotliSignature(
        withdrawDelegatedStakeBody,
        normalizePublicKey(this.publicKey),
        this.m_keyTrio.privateKey
      );
    } catch (err) {
      throw new Error("Error generating the withdraw delegated stake");
    }

    if (!signedWithdrawDelegatedStake) {
      throw new Error("Unable to generate signed withdraw delegated stake");
    }

    try {
      // Post signed withdraw delegated stake body
      withdrawDelegatedStakeResponse =
        await this.network.l0Api.putWithdrawDelegatedStake(
          signedWithdrawDelegatedStake
        );
    } catch (err) {
      throw new Error("Error sending the withdraw delegated stake transaction");
    }

    return withdrawDelegatedStakeResponse;
  }

  async transferDagBatch(
    transfers: TransferBatchItem[],
    lastRef?: TransactionReference
  ) {
    const txns = await this.generateBatchTransactions(transfers, lastRef);

    return this.sendBatchTransactions(txns);
  }

  createMetagraphTokenClient(networkInfo: MetagraphNetworkInfo) {
    return new MetagraphTokenClient(this, networkInfo);
  }
}

type TransferBatchItem = {
  address: string;
  amount: number;
  fee?: number;
};
