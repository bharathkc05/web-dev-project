// server/src/shared/middleware/validate.js
const formatZodErrors = (issues) => issues.reduce((accumulator, issue) => {
  const field = issue.path.length > 0 ? issue.path.join('.') : 'root';

  if (!accumulator[field]) {
    accumulator[field] = issue.message;
  }

  return accumulator;
}, {});

const createValidator = (schema, requestKey, message) => (req, res, next) => {
  const result = schema.safeParse(req[requestKey]);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message,
      errors: formatZodErrors(result.error.issues),
    });
  }

  req[requestKey] = result.data;
  return next();
};

export const validateRequest = (schema) => createValidator(schema, 'body', 'Validation failed');
export const validate = validateRequest;
export const validateQuery = (schema) => createValidator(schema, 'query', 'Invalid query parameters');
export const validateParams = (schema) => createValidator(schema, 'params', 'Invalid route parameters');
