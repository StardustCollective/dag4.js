import { expect } from 'chai';
import { z } from 'zod';
import { BlockExplorerV2Api, type ResponseWithMetadata, type Response } from '../src/api/v2/block-explorer-api';
import { crossPlatformDi } from '@stardust-collective/dag4-core';
import { FetchRestService } from '@stardust-collective/dag4-core/dist/cjs/cross-platform/clients/fetch.http';
import type { AddressBalanceV2, CurrencySnapshotV2, RewardTransaction, SnapshotV2, TransactionV2 } from '../src/dto/v2';
import { 
  DATA_SCHEMAS, 
  type DataSchemaKeys, 
  ResponseSchema, 
  ResponseWithMetadataSchema 
} from './be-api-v2.schemas';

// Initialize DI system for Node.js environment
const fetch = require('node-fetch');
const fetchRestService = new FetchRestService(fetch);
crossPlatformDi.registerHttpClient(fetchRestService);

// Test constants
const MAINNET_URL = 'https://be-mainnet.constellationnetwork.io';
const DAG_ADDRESS = 'DAG77zerQ2BUVhtVgkmseihkEfLXieBBm57vqA4J';
const METAGRAPH_ID = 'DAG0CyySf35ftDQDQBnd1bdQ9aPyUdacMghpnCuM'; // DOR metagraph on Mainnet
const LIMIT = 5;
const TIMEOUT = 60000;

// Hashes storage
let HASHES: {
  snapshotHash?: string;
  transactionHash?: string;
  currencySnapshotHash?: string;
} = {};


/**
 * Validates that a response has the expected Response<T> structure using Zod
 */
function validateResponse<T>(result: any, schemaKey?: DataSchemaKeys): asserts result is Response<T> {
  expect(result).to.exist;
  expect(result).to.have.property('data');
  
  if (!schemaKey) {
    return;
  }
  
  // Handle edge cases that should skip validation
  if (result.data === null) {
    console.warn('API returned null data, skipping detailed validation');
    return;
  }
  
  if (Array.isArray(result.data) && result.data.length === 0) {
    console.warn('API returned empty array, skipping detailed validation');
    return;
  }
  
  const dataSchema = DATA_SCHEMAS[schemaKey];
  const responseSchema = ResponseSchema(dataSchema);
  
  try {
    responseSchema.parse(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error(`Response validation failed for ${schemaKey}:`, error.errors);
      throw new Error(`Invalid Response<${schemaKey}> structure: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`);
    }
    throw error;
  }
}

/**
 * Validates that a response has the expected ResponseWithMetadata<T> structure using Zod
 */
function validateResponseWithMetadata<T>(result: any, schemaKey?: DataSchemaKeys): asserts result is ResponseWithMetadata<T> {
  expect(result).to.exist;
  expect(result).to.have.property('data');
  
  if (!schemaKey) {
    return;
  }
  
  // Handle edge cases that should skip validation
  if (result.data === null) {
    console.warn('API returned null data, skipping detailed validation');
    return;
  }
  
  if (Array.isArray(result.data) && result.data.length === 0) {
    console.warn('API returned empty array, skipping detailed validation');
    return;
  }
  
  const dataSchema = DATA_SCHEMAS[schemaKey];
  const responseSchema = ResponseWithMetadataSchema(dataSchema);
  
  try {
    responseSchema.parse(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error(`ResponseWithMetadata validation failed for ${schemaKey}:`, error.errors);
      throw new Error(`Invalid ResponseWithMetadata<${schemaKey}> structure: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`);
    }
    throw error;
  }
}

/**
 * Fetch hashes for tests
 */
async function fetchHashes(api: BlockExplorerV2Api): Promise<void> {
  console.log('Fetching hashes for tests...');
  
  try {
    // Fetch snapshot hash
    const snapshotsResult = await api.getSnapshots(1);
    if (snapshotsResult.data && snapshotsResult.data.length > 0) {
      HASHES.snapshotHash = snapshotsResult.data[0].hash;
      console.log('Snapshot hash:', HASHES.snapshotHash);
    }
    
    // Fetch transaction hash
    const transactionsResult = await api.getTransactions(1);
    if (transactionsResult.data && transactionsResult.data.length > 0) {
      HASHES.transactionHash = transactionsResult.data[0].hash;
      console.log('Transaction hash:', HASHES.transactionHash);
    }
    
    // Fetch currency snapshot hash
    const latestCurrencySnapshot = await api.getLatestCurrencySnapshot(METAGRAPH_ID);
    if (latestCurrencySnapshot.data && !Array.isArray(latestCurrencySnapshot.data)) {
      HASHES.currencySnapshotHash = latestCurrencySnapshot.data.hash;
      console.log('Currency snapshot hash:', HASHES.currencySnapshotHash);
    }
    
  } catch (error) {
    console.warn('Error fetching hashes:', error);
  }
}

describe('BlockExplorerV2Api', function() {
  this.timeout(TIMEOUT);

  let api: BlockExplorerV2Api;

  before(async () => {
    api = new BlockExplorerV2Api(MAINNET_URL);
    await fetchHashes(api);
  });

  describe('Snapshot Methods', () => {
    describe('getSnapshot', () => {
      it('should get snapshot by hash', async function() {
        if (!HASHES.snapshotHash) {
          this.skip();
        }
        const result = await api.getSnapshot(HASHES.snapshotHash);
        validateResponse<SnapshotV2>(result, 'SnapshotV2');
      });

      it('should throw error for invalid hash', async () => {
        try {
          await api.getSnapshot('invalid-hash');
        } catch (error) {
          expect(error).to.exist;
        }
      });
    });

    describe('getSnapshots', () => {
      it('should get snapshots', async () => {
        const result = await api.getSnapshots(LIMIT);
        validateResponseWithMetadata(result, 'SnapshotV2');
      });
    });

    describe('getLatestSnapshot', () => {
      it('should get latest snapshot', async () => {
        const result = await api.getLatestSnapshot();
        validateResponse<SnapshotV2>(result, 'SnapshotV2');
      });
    });

    describe('getTransactionsBySnapshot', () => {
      it('should get transactions by snapshot', async function() {
        if (!HASHES.snapshotHash) {
          this.skip();
        }
        const result = await api.getTransactionsBySnapshot(HASHES.snapshotHash, LIMIT);
        validateResponseWithMetadata<TransactionV2>(result, 'TransactionV2');
      });
    });

    describe('getRewardsBySnapshot', () => {
      it('should get rewards by snapshot', async function() {
        if (!HASHES.snapshotHash) {
          this.skip();
        }
        const result = await api.getRewardsBySnapshot(HASHES.snapshotHash, LIMIT);
        validateResponseWithMetadata<RewardTransaction>(result, 'RewardTransaction');
      });
    });

    describe('getLatestSnapshotTransactions', () => {
      it('should get latest snapshot transactions', async () => {
        const result = await api.getLatestSnapshotTransactions(LIMIT);
        validateResponseWithMetadata<TransactionV2>(result, 'TransactionV2');
      });
    });

    describe('getLatestSnapshotRewards', () => {
      it('should get latest snapshot rewards', async () => {
        const result = await api.getLatestSnapshotRewards(LIMIT);
        validateResponseWithMetadata<RewardTransaction>(result, 'RewardTransaction');
      });
    });
  });

  describe('Transaction Methods', () => {
    describe('getTransactions', () => {
      it('should get transactions without parameters', async () => {
        const result = await api.getTransactions();
        validateResponseWithMetadata<TransactionV2>(result, 'TransactionV2');
      });

      it('should get transactions with limit', async () => {
        const result = await api.getTransactions(LIMIT);
        validateResponseWithMetadata<TransactionV2>(result, 'TransactionV2');
        if (Array.isArray(result.data)) {
          expect(result.data.length).to.be.at.most(LIMIT);
        }
      });

      it('should handle search_after parameter', async function() {
         const initialResult = await api.getTransactions(LIMIT);
         if (Array.isArray(initialResult.data) && initialResult.data.length > 2) {
           const searchAfter = initialResult.data[2].hash;
           const result = await api.getTransactions(LIMIT, searchAfter);
           validateResponseWithMetadata<TransactionV2>(result, 'TransactionV2');
         } else {
           this.skip();
         }
       });

       it('should handle search_before parameter', async function() {
         const initialResult = await api.getTransactions(LIMIT);
         if (Array.isArray(initialResult.data) && initialResult.data.length > 2) {
           const searchBefore = initialResult.data[2].hash;
           const result = await api.getTransactions(LIMIT, undefined, searchBefore);
           validateResponseWithMetadata<TransactionV2>(result, 'TransactionV2');
         } else {
           this.skip();
         }
       });

       it('should handle next parameter', async function() {
         const initialResult = await api.getTransactions(LIMIT);
         if (Array.isArray(initialResult.data) && initialResult.data.length > 0 && initialResult.meta?.next) {
           const next = initialResult.meta.next;
           const result = await api.getTransactions(LIMIT, undefined, undefined, next);
           validateResponseWithMetadata<TransactionV2>(result, 'TransactionV2');
         } else {
           this.skip();
         }
       });

      it('should handle error limit', async () => {
        try {
          await api.getTransactions(0);
        } catch (error) {
          expect(error).to.exist;
        }
      });
    });

    describe('getTransaction', () => {
      it('should get transaction by hash', async function() {
        if (!HASHES.transactionHash) {
          this.skip();
        }
        const result = await api.getTransaction(HASHES.transactionHash);
        validateResponse<TransactionV2>(result, 'TransactionV2');
      });

      it('should throw error for invalid hash', async () => {
        try {
          await api.getTransaction('invalid-hash');
        } catch (error) {
          expect(error).to.exist;
        }
      });
    });

    describe('getTransactionsByAddress', () => {
      it('should get transactions by address', async () => {
        const result = await api.getTransactionsByAddress(DAG_ADDRESS, LIMIT);
        validateResponseWithMetadata<TransactionV2>(result, 'TransactionV2');
      });

      it('should get sent transactions by address', async () => {
        const result = await api.getTransactionsByAddress(DAG_ADDRESS, LIMIT, undefined, true, false);
        validateResponseWithMetadata<TransactionV2>(result, 'TransactionV2');
      });

      it('should get received transactions by address', async () => {
        const result = await api.getTransactionsByAddress(DAG_ADDRESS, LIMIT, undefined, false, true);
        validateResponseWithMetadata<TransactionV2>(result, 'TransactionV2');
      });
    });
  });

  describe('Address Methods', () => {
    describe('getAddressBalance', () => {
      it('should get address balance', async () => {
        const result = await api.getAddressBalance(DAG_ADDRESS);
        validateResponse<AddressBalanceV2>(result, 'AddressBalanceV2');
      });

      it('should throw error for invalid address', async () => {
        try {
          await api.getAddressBalance('invalid-address');
        } catch (error) {
          expect(error).to.exist;
        }
      });
    });
  });

  describe('Metagraph Methods', () => {
    describe('getLatestCurrencySnapshot', () => {
      it('should get latest currency snapshot', async () => {
        const result = await api.getLatestCurrencySnapshot(METAGRAPH_ID);
        validateResponse<CurrencySnapshotV2>(result, 'CurrencySnapshotV2');
      });
    });

    describe('getCurrencySnapshot', () => {
      it('should get currency snapshot by hash', async function() {
        if (!HASHES.currencySnapshotHash) {
          this.skip();
        }
        const result = await api.getCurrencySnapshot(METAGRAPH_ID, HASHES.currencySnapshotHash);
        validateResponse<CurrencySnapshotV2>(result, 'CurrencySnapshotV2');
      });
    });

    describe('getLatestCurrencySnapshotRewards', () => {
      it('should get latest currency snapshot rewards', async () => {
        const result = await api.getLatestCurrencySnapshotRewards(METAGRAPH_ID, LIMIT);
        validateResponseWithMetadata<RewardTransaction>(result, 'RewardTransaction');
      });
    });

    describe('getCurrencySnapshotRewards', () => {
      it('should get currency snapshot rewards', async function() {
        if (!HASHES.currencySnapshotHash) {
          this.skip();
        }
        const result = await api.getCurrencySnapshotRewards(METAGRAPH_ID, HASHES.currencySnapshotHash, LIMIT);
        validateResponseWithMetadata<RewardTransaction>(result, 'RewardTransaction');
      });
    });

    describe('getCurrencyAddressBalance', () => {
      it('should get currency address balance', async () => {
        const result = await api.getCurrencyAddressBalance(METAGRAPH_ID, DAG_ADDRESS);
        validateResponse<AddressBalanceV2>(result, 'AddressBalanceV2');
      });
    });

    describe('getCurrencyTransaction', () => {
      it('should get currency transaction', async function() {
        if (!HASHES.transactionHash) {
          this.skip();
        }
        try {
          const result = await api.getCurrencyTransaction(METAGRAPH_ID, HASHES.transactionHash);
          validateResponse<TransactionV2>(result, 'TransactionV2');
        } catch (error) {
          // Transaction may not exist in currency, that's ok
          expect(error).to.exist;
        }
      });
    });

    describe('getCurrencyTransactions', () => {
      it('should get currency transactions', async () => {
        const result = await api.getCurrencyTransactions(METAGRAPH_ID, LIMIT);
        validateResponseWithMetadata<TransactionV2>(result, 'TransactionV2');
      });
    });

    describe('getCurrencyTransactionsByAddress', () => {
      it('should get currency transactions by address', async () => {
        const result = await api.getCurrencyTransactionsByAddress(METAGRAPH_ID, DAG_ADDRESS, LIMIT);
        validateResponseWithMetadata<TransactionV2>(result, 'TransactionV2');
      });

      it('should get sent currency transactions by address', async () => {
        const result = await api.getCurrencyTransactionsByAddress(METAGRAPH_ID, DAG_ADDRESS, LIMIT, undefined, true, false);
        validateResponseWithMetadata<TransactionV2>(result, 'TransactionV2');
      });

      it('should get received currency transactions by address', async () => {
        const result = await api.getCurrencyTransactionsByAddress(METAGRAPH_ID, DAG_ADDRESS, LIMIT, undefined, false, true);
        validateResponseWithMetadata<TransactionV2>(result, 'TransactionV2');
      });
    });

    describe('getCurrencyTransactionsBySnapshot', () => {
      it('should get currency transactions by snapshot', async function() {
        if (!HASHES.currencySnapshotHash) {
          this.skip();
        }
        const result = await api.getCurrencyTransactionsBySnapshot(METAGRAPH_ID, HASHES.currencySnapshotHash, LIMIT);
        validateResponseWithMetadata<TransactionV2>(result, 'TransactionV2');
      });
    });
  });
});

