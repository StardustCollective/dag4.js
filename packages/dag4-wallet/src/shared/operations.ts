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
import { DagAccount } from "../dag-account";

type SharedNetwork = DagNetwork | GlobalDagNetwork | MetagraphTokenNetwork;
type OperationType = "allowSpend" | "tokenLock";
type BodyType = AllowSpendWithCurrencyId | TokenLockWithCurrencyId;

export const executeOperation = async (
  type: OperationType,
  body: BodyType,
  network: SharedNetwork,
  account: DagAccount
) => {
  if (!account.isActive() || !account.address) {
    throw new Error(
      "Account is not active. Make sure to login before executing this operation"
    );
  }

  switch (type) {
    case "allowSpend":
      return allowSpend(
        body as AllowSpendWithCurrencyId,
        network,
        account.keyTrio
      );
    case "tokenLock":
      return tokenLock(
        body as TokenLockWithCurrencyId,
        network,
        account.keyTrio
      );
    default:
      throw new Error(`Invalid operation type: ${type}`);
  }
};

const allowSpend = async (
  body: AllowSpendWithCurrencyId,
  network: SharedNetwork,
  keyTrio: KeyTrio
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
    throw new Error("Error getting the allow spend last reference");
  }

  if (!allowSpendLastRef) {
    throw new Error("Unable to find allow spend last reference");
  }

  try {
    // Generate signed allow spend body
    const allowSpendBody = {
      ...body,
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
    throw new Error("Error generating the signed allow spend");
  }

  if (!signedAllowSpend) {
    throw new Error("Unable to generate signed allow spend");
  }

  try {
    // Post signed allow spend body
    allowSpendResponse = await network.l1Api.postAllowSpend(signedAllowSpend);
  } catch (err) {
    throw new Error("Error sending the allow spend transaction");
  }

  if (!allowSpendResponse || !allowSpendResponse.hash) {
    throw new Error("Unable to get allow spend response");
  }

  return allowSpendResponse;
};

const tokenLock = async (
  body: TokenLockWithCurrencyId,
  network: SharedNetwork,
  keyTrio: KeyTrio
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
    throw new Error("Error getting the token lock last reference");
  }

  if (!tokenLockLastRef) {
    throw new Error("Unable to find token lock last reference");
  }

  try {
    // Generate signed token lock body
    const tokenLockBody: TokenLockWithParent = {
      ...body,
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
    throw new Error("Error generating the signed token lock");
  }

  if (!signedTokenLock) {
    throw new Error("Unable to generate signed token lock");
  }

  try {
    // Post signed token lock body
    tokenLockResponse = await network.l1Api.postTokenLock(signedTokenLock);
  } catch (err) {
    throw new Error("Error sending the token lock transaction");
  }

  if (!tokenLockResponse || !tokenLockResponse.hash) {
    throw new Error("Unable to get token lock response");
  }

  return tokenLockResponse;
};
