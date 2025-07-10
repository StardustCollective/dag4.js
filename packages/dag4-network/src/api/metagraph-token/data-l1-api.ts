import { RestApi } from "@stardust-collective/dag4-core";
import type { EstimateFeeResponse, SendDataFeeResponse } from "../../dto/v2/metagraph";

class MetagraphTokenDataL1Api {
  protected service = new RestApi('');

  constructor(host: string) {
    this.config().baseUrl(host);
  }

  config() {
    return this.service.configure();
  }

  async getDataFeeEstimate(data: any) {
    return this.service.$post<EstimateFeeResponse>('/data/estimate-fee', data);
  }

  async postDataTransaction(data: any) {
    return this.service.$post<SendDataFeeResponse>('/data', data);
  }
}

export { MetagraphTokenDataL1Api };
