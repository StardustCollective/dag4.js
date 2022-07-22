import {RestApi} from '@stardust-collective/dag4-core';
import {DNC} from '../../DNC';
import {Block, Snapshot, Transaction} from '../../dto/v1';



type HashOrHeight = string | number;

export class BlockExplorerApi {
  private service = new RestApi(DNC.BLOCK_EXPLORER_URL);

  constructor (host?: string) {
    if (host) {
      this.config().baseUrl(host);
    }
  }

  config () {
    return this.service.configure();
  }

  async getLatestSnapshot () {
    return this.service.$get<Snapshot>('/snapshot/latest');
  }

  async getSnapshot (id: HashOrHeight) {
    return this.service.$get<Snapshot>('/snapshot/' + id);
  }

  async getTransactionsBySnapshot (id: HashOrHeight) {
    return this.service.$get<Transaction[]>('/snapshot/' + id + '/transaction');
  }

  async getTransactionsByAddress (address: string, limit: number = 0, searchAfter = '', sentOnly = false, receivedOnly = false) {
    let params, path = '/address/' + address + '/transaction';

    if (limit || searchAfter) {
      params = {};

      if (limit > 0) {
        params.limit = limit;
      }

      if (searchAfter) {
        try {
          new Date(searchAfter).toISOString();
        } catch(e) {
          throw new Error('ParamError: "searchAfter" is not valid ISO 8601');
        }

        params.search_after = searchAfter;
      }
    }


    if (sentOnly) {
      path += '/sent'
    }
    else if (receivedOnly) {
      path += '/received'
    }

    return this.service.$get<Transaction[]>(path, params);
  }

  async getCheckpointBlock(hash: string) {
    return this.service.$get<Block>('/checkpoint-block/' + hash);
  }

  async getTransaction (hash: string) {
    return this.service.$get<Transaction>('/transaction/' + hash);
  }
}

export const blockExplorerApi = new BlockExplorerApi();


