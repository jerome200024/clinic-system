const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: result.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
  }
  req.body = result.data;
  next();
};

module.exports = validate;