import { keyStore, KeyTrio } from "@stardust-collective/dag4-keystore";
import {
  AllowSpendWithCurrencyId,
  DagNetwork,
  GlobalDagNetwork,
  HashResponse,
  MetagraphTokenNetwork,
  SignedAllowSpend,
  SignedTokenLock,
  TokenLockWithCurrencyId,
  TokenLockWithParent,
  TransactionReference,
} from "@stardust-collective/dag4-network";
import { normalizePublicKey } from "../utils";
import {
  dagAddressValidator,
  allowSpendSchema,
  tokenLockSchema,
  validateArraySchema,
  validateSchema,
} from "../validationSchemas";

type SharedNetwork = DagNetwork | GlobalDagNetwork | MetagraphTokenNetwork;

export const allowSpend = async (
  body: AllowSpendWithCurrencyId,
  network: SharedNetwork,
  keyTrio: KeyTrio,
  params?: Record<string, any>
): Promise<HashResponse> => {
  validateSchema(body, allowSpendSchema, true);

  // Validate approvers array
  validateArraySchema(body.approvers, dagAddressValidator, true);

  if (body.source !== keyTrio.address) {
    throw new Error('"source" must be the same as the account address');
  }

  let allowSpendLastRef: TransactionReference | null = null;
  let signedAllowSpend: SignedAllowSpend | null = null;
  let allowSpendResponse: HashResponse | null = null;

  try {
    // Get allow spend last reference
    allowSpendLastRef = await network.l1Api.getAllowSpendLastRef(
      keyTrio.address
    );
  } catch (err) {
    console.error("Error getting the allow spend last reference");
    throw err;
  }

  if (!allowSpendLastRef) {
    throw new Error("Unable to find allow spend last reference");
  }

  try {
    // Generate signed allow spend body
    const allowSpendBody = {
      source: body.source,
      destination: body.destination,
      approvers: body.approvers,
      amount: body.amount,
      parent: allowSpendLastRef,
      lastValidEpochProgress: body.validUntilEpoch,
      currencyId: body.currencyId ?? null,
      fee: body.fee ?? 0,
    };
    signedAllowSpend = await keyStore.generateBrotliSignature(
      allowSpendBody,
      normalizePublicKey(keyTrio.publicKey),
      keyTrio.privateKey
    );
  } catch (err) {
    console.error("Error generating the signed allow spend");
    throw err;
  }

  if (!signedAllowSpend) {
    throw new Error("Unable to generate signed allow spend");
  }

  try {
    // Post signed allow spend body
    allowSpendResponse = await network.l1Api.postAllowSpend(signedAllowSpend, params);
  } catch (err) {
    console.error("Error sending the allow spend transaction");
    throw err;
  }

  if (!allowSpendResponse || !allowSpendResponse.hash) {
    throw new Error("Unable to get allow spend response");
  }

  return allowSpendResponse;
};

export const tokenLock = async (
  body: TokenLockWithCurrencyId,
  network: SharedNetwork,
  keyTrio: KeyTrio,
  params?: Record<string, any>
): Promise<HashResponse> => {
  validateSchema(body, tokenLockSchema, true);

  if (body.source !== keyTrio.address) {
    throw new Error('"source" must be the same as the account address');
  }

  let tokenLockLastRef: TransactionReference | null = null;
  let signedTokenLock: SignedTokenLock | null = null;
  let tokenLockResponse: HashResponse | null = null;

  try {
    // Get token lock last reference
    tokenLockLastRef = await network.l1Api.getTokenLockLastRef(keyTrio.address);
  } catch (err) {
    console.error("Error getting the token lock last reference");
    throw err;
  }

  if (!tokenLockLastRef) {
    throw new Error("Unable to find token lock last reference");
  }

  try {
    // Generate signed token lock body
    const tokenLockBody: TokenLockWithParent = {
      source: body.source,
      amount: body.amount,
      parent: tokenLockLastRef,
      currencyId: body.currencyId ?? null,
      fee: body.fee ?? 0,
      unlockEpoch: body.unlockEpoch ?? null,
    };
    signedTokenLock = await keyStore.generateBrotliSignature(
      tokenLockBody,
      normalizePublicKey(keyTrio.publicKey),
      keyTrio.privateKey
    );
  } catch (err) {
    console.error("Error generating the signed token lock");
    throw err;
  }

  if (!signedTokenLock) {
    throw new Error("Unable to generate signed token lock");
  }

  try {
    // Post signed token lock body
    tokenLockResponse = await network.l1Api.postTokenLock(signedTokenLock, params);
  } catch (err) {
    console.error("Error sending the token lock transaction");
    throw err;
  }

  if (!tokenLockResponse || !tokenLockResponse.hash) {
    throw new Error("Unable to get token lock response");
  }

  return tokenLockResponse;
};
