import fetch from "cross-fetch";
import {
  arrayUtils,
  dagDi,
  IHttpClient as _IHttpClient,
  IKeyValueDb as _IKeyValueDb,
  RestApi as _RestApi,
  RestApiOptionsRequest as _RestApiOptionsRequest,
} from "@stardust-collective/dag4-core";
import {
  globalDagNetwork,
  Snapshot as _Snapshot,
  Transaction as _Transaction,
  PendingTx as _PendingTx,
  NetworkInfo as _NetworkInfo,
  MetagraphNetworkInfo as _MetagraphNetworkInfo,
  MetagraphNetworkInfo,
} from "@stardust-collective/dag4-network";
import {
  keyStore,
  HDKey as _HDKey,
  DERIVATION_PATH as _DERIVATION_PATH,
} from "@stardust-collective/dag4-keystore";
import {
  MetagraphTokenClient,
  DagAccount,
  DagMonitor,
} from "@stardust-collective/dag4-wallet";

/**
 * Type definitions for the dag4.js library
 * Re-exports types from other packages for easier access
 */
export namespace Dag4Types {
  /** HD wallet key type */
  export type HDKey = _HDKey;
  /** Derivation path type for HD wallets */
  export type DERIVATION_PATH = _DERIVATION_PATH;
  /** REST API client type */
  export type RestApi = _RestApi;
  /** Key-value database interface type */
  export type IKeyValueDb = _IKeyValueDb;
  /** HTTP client interface type */
  export type IHttpClient = _IHttpClient;
  /** Transaction type */
  export type Transaction = _Transaction;
  /** Pending transaction type */
  export type PendingTx = _PendingTx;
  /** Network information type */
  export type NetworkInfo = _NetworkInfo;
  /** Metagraph network information type */
  export type MetagraphNetworkInfo = _MetagraphNetworkInfo;
  /** Snapshot type */
  export type Snapshot = _Snapshot;
  /** REST API options request type */
  export type RestApiOptionsRequest = _RestApiOptionsRequest;
}

/**
 * Internal class for managing dag4.js packages
 * Provides methods for creating accounts and monitors
 */
class Dag4Packages {
  private account: DagAccount;
  private monitor: DagMonitor;

  /**
   * Creates a new DAG account
   * @param {string} [privateKey] - Optional private key to use for the account
   * @returns {DagAccount} A new DAG account instance
   */
  createAccount(privateKey?: string) {
    const account = new DagAccount(globalDagNetwork);

    if (privateKey) {
      account.loginPrivateKey(privateKey);
    }

    return account;
  }

  /**
   * Creates a new Metagraph token client
   * @param {DagAccount} account - The DAG account to use
   * @param {MetagraphNetworkInfo} networkInfo - The Metagraph network information
   * @returns {MetagraphTokenClient} A new Metagraph token client instance
   */
  createMetagraphTokenClient(
    account: DagAccount,
    networkInfo: MetagraphNetworkInfo
  ) {
    return new MetagraphTokenClient(account, networkInfo);
  }

  /**
   * Creates or gets the global DAG account
   * @returns {DagAccount} The global DAG account instance
   */
  createOrGetGlobalAccount() {
    if (!this.account) {
      this.account = new DagAccount(globalDagNetwork);
    }
    return this.account;
  }

  /**
   * Creates or gets the global DAG monitor
   * @returns {DagMonitor} The global DAG monitor instance
   */
  createOrGetGlobalMonitor() {
    if (!this.monitor) {
      this.monitor = new DagMonitor(this.createOrGetGlobalAccount());
    }
    return this.monitor;
  }
}

const dag4Packages = new Dag4Packages();

/**
 * Main dag4.js library object
 * Provides access to all dag4.js functionality
 */
export const dag4 = {
  /** Key store for managing keys */
  keyStore,
  /** Dependency injection container */
  di: dagDi,
  /**
   * Creates a new DAG account
   * @param {string} [privateKey] - Optional private key to use for the account
   * @returns {DagAccount} A new DAG account instance
   */
  createAccount(privateKey?: string) {
    return dag4Packages.createAccount(privateKey);
  },
  /**
   * Creates a new Metagraph token client
   * @param {DagAccount} account - The DAG account to use
   * @param {MetagraphNetworkInfo} networkInfo - The Metagraph network information
   * @returns {MetagraphTokenClient} A new Metagraph token client instance
   */
  createMetagraphTokenClient(
    account: DagAccount,
    networkInfo: MetagraphNetworkInfo
  ) {
    return dag4Packages.createMetagraphTokenClient(account, networkInfo);
  },
  /**
   * Gets the global DAG account
   * @returns {DagAccount} The global DAG account instance
   */
  get account() {
    return dag4Packages.createOrGetGlobalAccount();
  },
  /**
   * Gets the global DAG monitor
   * @returns {DagMonitor} The global DAG monitor instance
   */
  get monitor() {
    return dag4Packages.createOrGetGlobalMonitor();
  },
  /**
   * Configures the dag4.js library
   * @param {Dag4Config} config - The configuration object
   */
  config: (config: Dag4Config) => {
    dagDi.getStateStorageDb().setPrefix(config.appId);
    globalDagNetwork.config(config.network);
  },
  /** Global DAG network instance */
  network: globalDagNetwork,
  /** Array utilities */
  arrayUtils,
};

/**
 * Configuration type for the dag4.js library
 */
type Dag4Config = {
  /** Application ID for storage prefix */
  appId: string;
  /** Network configuration */
  network: Dag4Types.NetworkInfo;
};

// default config
dag4.di.useFetchHttpClient(fetch);
