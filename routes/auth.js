var express = require('express');
var router = express.Router();

const AuthController = require('../controllers/AuthController')
const auth_Controller = new AuthController()


router.post('/register', auth_Controller.registerSchema, auth_Controller.register);
router.post('/verify-email', auth_Controller.verifyEmailSchema , auth_Controller.verifyEmail);

router.post('/login', auth_Controller.authenticateSchema, auth_Controller.authenticate)

router.post('/forgot-password', auth_Controller.forgotPasswordSchema, auth_Controller.forgotPassword);
router.post('/validate-reset-token', auth_Controller.validateResetTokenSchema, auth_Controller.validateResetToken);
router.post('/reset-password', auth_Controller.resetPasswordSchema, auth_Controller.resetPassword);


module.exports = router;


module.exports = router;

