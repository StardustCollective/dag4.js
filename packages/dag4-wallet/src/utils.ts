import { keyStore } from "@stardust-collective/dag4-keystore";

/**
 * Custom validation error class
 */
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
  }
}

/**
 * Validation utilities with custom error messages
 */
const validators = {
  type: (value, type, key) => {
    // Handle array of types
    if (Array.isArray(type)) {
      const isValid = type.some((t) => {
        if (t === "null" && value === null) return true;
        if (t === "undefined" && value === undefined) return true;
        return typeof value === t;
      });

      if (!isValid) {
        const typeString = type.join(" | ");
        throw new ValidationError(`"${key}" must be of type ${typeString}.`);
      }
    } else {
      // Handle single type for backward compatibility
      if (type === "null" && value !== null) {
        throw new ValidationError(`"${key}" must be null.`);
      }
      if (type === "undefined" && value !== undefined) {
        throw new ValidationError(`"${key}" must be undefined.`);
      }
      if (typeof value !== type && value !== null && value !== undefined) {
        throw new ValidationError(`"${key}" must be of type ${type}.`);
      }
    }
  },

  required: (value, key) => {
    if (value === undefined) {
      throw new ValidationError(`"${key}" is required.`);
    }
  },

  positive: (value, key) => {
    if (typeof value !== "number" || value < 0) {
      throw new ValidationError(`"${key}" must be greater than zero.`);
    }
  },

  negative: (value, key) => {
    if (typeof value !== "number" || value > 0) {
      throw new ValidationError(`"${key}" must be less than zero.`);
    }
  },

  nonZero: (value, key) => {
    if (typeof value !== "number" || value === 0) {
      throw new ValidationError(`"${key}" cannot be zero.`);
    }
  },

  dagAddress: (value, key) => {
    // Example validation for DAG address format
    if (typeof value !== "string" || !keyStore.validateDagAddress(value)) {
      throw new ValidationError(`"${key}" must be a valid DAG address.`);
    }
  },

  noEmpty: (value, key) => {
    if (Array.isArray(value)) {
      if (value.length === 0) {
        throw new ValidationError(`"${key}" cannot be an empty array.`);
      }
    } else if (typeof value === "object" && value !== null) {
      if (Object.keys(value).length === 0) {
        throw new ValidationError(`"${key}" cannot be an empty object.`);
      }
    } else {
      throw new ValidationError(
        `"${key}" must be an array or object to check if empty.`
      );
    }
  },

  // Add more custom validations as needed
};

/**
 * Validates an object against a schema
 * @param {Object} obj - The object to validate
 * @param {Object} schema - The validation schema
 * @param {boolean} [checkNotEmpty=false] - Whether to check if the object is not empty
 * @throws {ValidationError} - Throws error on first validation failure
 */
export function validateObject(obj, schema, checkNotEmpty = false) {
  if (typeof obj !== "object" || Array.isArray(obj) || obj === null) {
    throw new ValidationError("Parameter must be an object");
  }

  // Check if object is not empty when checkNotEmpty is true
  if (checkNotEmpty && Object.keys(obj).length === 0) {
    throw new ValidationError("Object cannot be empty");
  }

  Object.keys(schema).forEach((key) => {
    const rules = schema[key];
    const value = obj[key];

    // Check required fields first
    if (rules.required) {
      validators.required(value, key);
    }

    // Skip validation for undefined optional values
    if (value === undefined && !rules.required) {
      return;
    }

    // Validate type
    if (rules.type) {
      validators.type(value, rules.type, key);
    }

    // Apply custom validations only if value is not null or undefined
    if (value !== null && value !== undefined) {
      Object.keys(rules).forEach((rule) => {
        if (
          rule !== "type" &&
          rule !== "required" &&
          validators[rule] &&
          rules[rule]
        ) {
          validators[rule](value, key);
        }
      });
    }
  });
}

/**
 * Validates an array against a schema
 * @param {Array} arr - The array to validate
 * @param {Object} itemSchema - The schema for each item
 * @param {boolean} [checkNotEmpty=false] - Whether to check if the array is not empty
 * @throws {ValidationError} - Throws error on first validation failure
 */
export function validateArray(arr, itemSchema, checkNotEmpty = false) {
  if (!Array.isArray(arr)) {
    throw new ValidationError("Parameter must be an array");
  }

  // Check if array is not empty when checkNotEmpty is true
  if (checkNotEmpty && arr.length === 0) {
    throw new ValidationError("Array cannot be empty");
  }

  arr.forEach((item, index) => {
    // Validate type
    if (itemSchema.type) {
      try {
        validators.type(item, itemSchema.type, `item[${index}]`);
      } catch (error) {
        throw new ValidationError(
          `Item at index ${index} ${error.message.substring(
            error.message.indexOf(" ")
          )}`
        );
      }
    }

    // Apply custom validations only if value is not null or undefined
    if (item !== null && item !== undefined) {
      Object.keys(itemSchema).forEach((rule) => {
        if (rule !== "type" && validators[rule] && itemSchema[rule]) {
          try {
            validators[rule](item, `item[${index}]`);
          } catch (error) {
            throw new ValidationError(
              `Item at index ${index} ${error.message.substring(
                error.message.indexOf(" ")
              )}`
            );
          }
        }
      });
    }
  });
}

/**
 * Validates parameters (detects type and calls appropriate validator)
 * @param {Object|Array} params - The parameters to validate
 * @param {Object} schema - The validation schema
 * @param {boolean} [checkNotEmpty=false] - Whether to check if the params object/array is not empty
 * @throws {ValidationError} - Throws error on first validation failure
 */
export function validateParams(params, schema, checkNotEmpty = false) {
  try {
    if (Array.isArray(params)) {
      validateArray(params, schema, checkNotEmpty);
    } else {
      validateObject(params, schema, checkNotEmpty);
    }
    return true; // Return true if validation passes
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error; // Re-throw validation errors
    } else {
      throw new ValidationError(`Validation failed: ${error.message}`);
    }
  }
}

export const normalizePublicKey = (publicKey: string): string => {
  if (publicKey.length === 130) {
    return publicKey.substring(2);
  } else if (publicKey.length === 128) {
    return publicKey;
  } else {
    throw new Error("Public key has wrong length");
  }
};
