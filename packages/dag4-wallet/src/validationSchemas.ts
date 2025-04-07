import { z } from "zod";
import { keyStore } from "@stardust-collective/dag4-keystore";

/**
 * Validator for DAG addresses
 */
export const dagAddressValidator = z
  .string()
  .refine((value) => keyStore.validateDagAddress(value), {
    message: "Must be a valid DAG address",
  });

/**
 * Validator for non-zero numbers
 */
const nonZeroNumber = z
  .number()
  .positive("Must be greater than zero")
  .refine((value) => value !== 0, {
    message: "Cannot be zero",
  });

/**
 * Validator for non-empty strings
 */
export const nonEmptyString = z.string().min(1, "String cannot be empty");

/**
 * Validator for zero or positive numbers
 */
export const zeroPositive = z.number().min(0, "Must be zero or positive");

/**
 * Validator for the currencyId field
 */
export const currencyIdValidator = z
  .union([z.string(), z.null()])
  .refine((value) => value === null || keyStore.validateDagAddress(value), {
    message: "Must be a valid DAG address or null",
  });

/**
 * Schema for validating post allow spend body
 */
export const postAllowSpendSchema = z.object({
  source: dagAddressValidator,
  destination: dagAddressValidator,
  amount: nonZeroNumber,
  fee: zeroPositive,
  currencyId: currencyIdValidator,
  validUntilEpoch: z
    .number()
    .positive("Valid until epoch must be greater than zero"),
  tokenL1Url: nonEmptyString,
});

/**
 * Schema for validating post token lock body
 */
export const postTokenLockSchema = z.object({
  source: dagAddressValidator,
  amount: nonZeroNumber,
  fee: zeroPositive,
  currencyId: currencyIdValidator,
  unlockEpoch: z
    .union([z.number(), z.null()])
    .refine((value) => value === null || value > 0, {
      message: "Unlock epoch must be greater than zero or null",
    }),
  tokenL1Url: nonEmptyString,
});

/**
 * Schema for validating post delegated stake body
 */
export const postDelegatedStakeSchema = z.object({
  source: dagAddressValidator,
  nodeId: nonEmptyString,
  amount: nonZeroNumber,
  fee: zeroPositive,
  tokenLockRef: nonEmptyString,
});

/**
 * Schema for validating put withdraw delegated stake body
 */
export const putWithdrawDelegatedStakeSchema = z.object({
  source: dagAddressValidator,
  stakeRef: nonEmptyString,
});

/**
 * Helper function to validate an object against a Zod schema
 * @param obj - The object to validate
 * @param schema - The Zod schema to validate against
 * @param checkNotEmpty - Whether to check if the object is not empty
 */
export function validateWithZod<T>(
  obj: T,
  schema: z.ZodType<T>,
  checkNotEmpty = false
): T {
  if (checkNotEmpty && Object.keys(obj).length === 0) {
    throw new Error("Object cannot be empty");
  }

  return schema.parse(obj);
}

/**
 * Helper function to validate an array against a Zod schema
 * @param arr - The array to validate
 * @param schema - The Zod schema to validate against
 * @param checkNotEmpty - Whether to check if the array is not empty
 */
export function validateArrayWithZod<T>(
  arr: T[],
  schema: z.ZodType<T>,
  checkNotEmpty = false
): T[] {
  if (checkNotEmpty) {
    return z.array(schema).nonempty("Array cannot be empty").parse(arr);
  }

  return z.array(schema).parse(arr);
}
