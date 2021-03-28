module.exports = validateRequest;

function validateRequest(req, res, next, schema) {
  const options = {
    abortEarly: false, // include all errors
    allowUnknown: true, // ignore unknown props
    stripUnknown: true // remove unknown props
  };
  const { error, value } = schema.validate(req.body, options);
  if (error) {
    const apiResponse = {
      success: false,
      data:{},
      error: error.details.map(x => x.message).join(', ')
    }
    res.json(apiResponse);   
  } else {
    req.body = value;
    next();
  }
}