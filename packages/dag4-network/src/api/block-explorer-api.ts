import {DNC} from '../DNC';
import {Block, Snapshot, Transaction} from '../dto';
import {RestApi} from '@stardust-collective/dag4-core';

export class BlockExplorerApi {
  private service = new RestApi(DNC.BLOCK_EXPLORER_URL);

  config () {
    return this.service.configure();
  }

  async getLatestSnapshot () {
    return this.service.$get<Snapshot>('/snapshot/latest');
  }

  async getSnapshot (height: number) {
    return this.service.$get<Snapshot>('/snapshot/' + height);
  }

  async getTransactionsByAddress (address: string, limit: number = 0, searchAfter = '') {
    let params;

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

    return this.service.$get<Transaction[]>('/address/' + address + '/transaction', params);
  }

  async getCheckpointBlock(id: string) {
    return this.service.$get<Block>('/checkpoint-block/' + id);
  }

  async getTransaction (id: string) {
    return this.service.$get<Transaction>('/transaction/' + id);
  }
}

export const blockExplorerApi = new BlockExplorerApi();


