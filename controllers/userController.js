const userRepo = require('../repositories/userRepo')
const validateRequest = require('../middlewares/validate-request');
const Joi = require('joi');

class UserController {

 getAll(req, res, next) {
  userRepo.getAll()
    .then(accounts => res.json(accounts))
    .catch(next);
}

 getById(req, res, next) {
  // users can get their own account and admins can get any account
  if (Number(req.params.id) !== req.user.id && req.user.role !== Role.Admin) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  userRepo.getById(req.params.id)
    .then(account => account ? res.json(account) : res.sendStatus(404))
    .catch(next);
}

 createSchema(req, res, next) {
  const schema = Joi.object({
    title: Joi.string().required(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
  });
  validateRequest(req, next, schema);
}

 create(req, res, next) {
  userRepo.create(req.body)
    .then(account => res.json(account))
    .catch(next);
}

 updateSchema(req, res, next) {
  const schemaRules = {
    title: Joi.string().empty(''),
    firstName: Joi.string().empty(''),
    lastName: Joi.string().empty(''),
    email: Joi.string().email().empty(''),
    password: Joi.string().min(6).empty(''),
    confirmPassword: Joi.string().valid(Joi.ref('password')).empty('')
  };

  const schema = Joi.object(schemaRules).with('password', 'confirmPassword');
  validateRequest(req, next, schema);
}

 update(req, res, next) {
  // users can update their own account and admins can update any account
  if (Number(req.params.id) !== req.user.id && req.user.role !== Role.Admin) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  userRepo.update(req.params.id, req.body)
    .then(account => res.json(account))
    .catch(next);
}

 _delete(req, res, next) {
  // users can delete their own account and admins can delete any account
  if (Number(req.params.id) !== req.user.id && req.user.role !== Role.Admin) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  userRepo.delete(req.params.id)
    .then(() => res.json({ message: 'Account deleted successfully' }))
    .catch(next);
}


}

module.exports = UserController

