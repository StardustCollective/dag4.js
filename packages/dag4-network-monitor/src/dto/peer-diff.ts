export class PeerDiff {

  private changes = [];

  hasChanges () {
    return this.changes.length > 0;
  }

  addPeer (ip: string) {
    this.changes.push({type:'AddPeer', value: ip});
  }

  removePeer (ip: string) {
    this.changes.push({type:'RemovePeer', value: ip});
  }
}
