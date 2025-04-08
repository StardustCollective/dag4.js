export const normalizePublicKey = (publicKey: string): string => {
  if (publicKey.length === 130) {
    return publicKey.substring(2);
  } else if (publicKey.length === 128) {
    return publicKey;
  } else {
    throw new Error("Public key has wrong length");
  }
};
