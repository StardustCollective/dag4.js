import { L1Api } from "../v2/l1-api";

class L0TokenL1Api extends L1Api {
  constructor(host: string) {
    super(host);
  }
}

export { L0TokenL1Api };
