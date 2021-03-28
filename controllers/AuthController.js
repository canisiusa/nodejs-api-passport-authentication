
const authRepo = require('../repositories/authRepo');
const userRepo = require('../repositories/userRepo');
const validateRequest = require('../middlewares/validate-request');
const passport = require('passport');
const Joi = require('joi');
require('../middlewares/passport')(passport);

class AuthController {


  registerSchema(req, res, next) {
    const schema = Joi.object({
      countryId: Joi.number().integer().required(),
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      email: Joi.string().email().required(),
      avatar: Joi.string().required(),
      password: Joi.string().min(6).required(),
      confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
    });
    validateRequest(req, res, next, schema);

  }

  register(req, res, next) {
    authRepo.register(req.body, req.get('origin'))
      .then((cb) => {
        const apiResponse = {
          success: cb.success,
          data: cb.message,
          error: {}
        }
        res.json(apiResponse)
      })
      .catch(next);
  }
  // end of register


  authenticateSchema = (req, res, next) => {
    const schema = Joi.object({
      email: Joi.string().required(),
      password: Joi.string().required()
    });
    validateRequest(req, res, next, schema);
  }
  authenticate = (req, res, next) => {
    passport.authenticate('login', async (err, user, info) => {
      try {
        if (err) {
          const error = new Error('Une erreur s\'est produite ');
          res.status(500)
          return next(error);
        } else if (!user) {
          const apiResponse = {
            success: false,
            data: {},
            error: info.message
          }
          res.json(apiResponse);
          return next()
        }
        req.login(user, { session: false }, async (error) => {
          if (error) return next(error);

          const ipAddress = req.ip;

          authRepo.authenticate({ user, ipAddress })
            .then((item) => {
              const { refreshToken } = item
              this.setTokenCookie(res, refreshToken)
              const apiResponse = {
                success: true,
                data: item,
                error: {}
              }
              res.json(apiResponse);
            })
            .catch(next);

        })
      } catch (error) {
        return next(error);
      }
    })(req, res, next);
  }


  refreshToken = (req, res, next) => {
    const token = req.cookies.refreshToken;
    const ipAddress = req.ip;
    const account = req.user
    authRepo.refreshToken({ account, token, ipAddress })
      .then(item => {
        const { refreshToken } = item
       this.setTokenCookie(res, refreshToken)
        const apiResponse = {
          success: true,
          data: item,
          error: {}
        }
        res.json(apiResponse);
        res.json(item);
      })
      .catch(next);
  }

  revokeTokenSchema(req, res, next) {
    const schema = Joi.object({
      token: Joi.string().empty('')
    });
    validateRequest(req, res, next, schema);
  }

  revokeToken(req, res, next) {
    // accept token from request body or cookie
    const token = req.body.token || req.cookies.refreshToken;
    const ipAddress = req.ip;

    if (!token) return res.status(400).json({ message: 'Token is required' })

    authRepo.revokeToken({ token, ipAddress })
      .then(() => res.json({ message: 'Token revoked' }))
      .catch(next);
  }
  verifyEmailSchema(req, res, next) {
    const schema = Joi.object({
      token: Joi.string().required()
    });
    validateRequest(req, res, next, schema);
  }

  
  verifyEmail(req, res, next) {
    const { token } = req.query
    if (!token || typeof token !== 'string') {
      const apiResponse = {
        success: false,
        data: {},
        error: {
          validation: {
            token: 'the token param is required and should be a string'
          }
        }
      }
      res.json(apiResponse)
    }
    authRepo.verifyEmail(token)
      .then((cb) => {
        const apiResponse = {
          success: cb.success,
          error: {
            message: cb.message
          },
          data: cb.data ?? ''
        }
        res.json(apiResponse)
      })
      .catch(next);
  }

  forgotPasswordSchema(req, res, next) {
    const schema = Joi.object({
      email: Joi.string().email().required()
    });
    validateRequest(req, res, next, schema);
  }

  forgotPassword(req, res, next) {
    authRepo.forgotPassword(req.body, req.get('origin'))
      .then(() => res.json({ message: 'Please check your email for password reset instructions' }))
      .catch(next);
  }

  validateResetTokenSchema(req, res, next) {
    const schema = Joi.object({
      token: Joi.string().required()
    });
    validateRequest(req, res, next, schema);
  }

  validateResetToken(req, res, next) {
    authRepo.validateResetToken(req.body)
      .then(() => res.json({ message: 'Token is valid' }))
      .catch(next);
  }

  resetPasswordSchema(req, res, next) {
    const schema = Joi.object({
      token: Joi.string().required(),
      password: Joi.string().min(6).required(),
      confirmPassword: Joi.string().valid(Joi.ref('password')).required()
    });
    validateRequest(req, res, next, schema);
  }

  resetPassword(req, res, next) {
    authRepo.resetPassword(req.body)
      .then(() => res.json({ message: 'Password reset successful, you can now login' }))
      .catch(next);
  }

  userInfos(req, res, next) {
    userRepo.getAccount(req.user.id).then((response)=>{
      res.json({ 
        success: true,
        data: response
      })
    }).catch(next)
  }

  // helper functions

  async setTokenCookie(res, token) {
    // create cookie with refresh token that expires in 2 days
    const cookieOptions = {
      httpOnly: true,
      expires: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
    };
    await res.cookie('refreshToken', token, cookieOptions);
  }

}

module.exports = AuthController
