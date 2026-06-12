// ─── Zod Validation Middleware ─────────────────────────────────
// Express middleware that validates request body / params against Zod schemas.
// Returns 400 with error details on failure.

const { error } = require('./response');

/**
 * Validates req.body against a Zod schema.
 * On success, replaces req.body with the parsed (coerced) data.
 * On failure, responds 400 with validation messages.
 *
 * @param {import('zod').ZodSchema} schema
 * @returns {import('express').RequestHandler}
 */
function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const messages = result.error.errors.map((e) => e.message).join(', ');
      return error(res, messages, 400);
    }
    req.body = result.data;
    next();
  };
}

/**
 * Validates a route param as a positive integer.
 * Handles NaN — Number('abc') returns NaN, which fails Number.isInteger.
 *
 * @param {string} paramName — name of the route param, e.g. 'id'
 * @returns {import('express').RequestHandler}
 */
function validateId(paramName) {
  return (req, res, next) => {
    const id = Number(req.params[paramName]);
    if (!Number.isInteger(id) || id < 1) {
      return error(res, 'ID inválido', 400);
    }
    req.params[paramName] = id;
    next();
  };
}

module.exports = { validate, validateId };
