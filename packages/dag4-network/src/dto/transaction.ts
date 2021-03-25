export type Transaction = {
  hash : string;
  amount : number;
  receiver : string;
  sender : string;
  fee : number;
  isDummy : true;
  timeAgo?: string;
  timestamp: string;
  lastTransactionRef : {
    prevHash : string;
    ordinal : number
  };
  snapshotHash : string;
  checkpointBlock : string;
}
