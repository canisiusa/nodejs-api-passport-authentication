var express = require('express');
var router = express.Router();

const AuthController = require('../controllers/AuthController')
const auth_Controller = new AuthController()

router.post('/refresh-token', auth_Controller.refreshToken);
router.post('/logout', function(req, res, next){
  req.logout()
  next()
},  auth_Controller.revokeTokenSchema, auth_Controller.revokeToken);

router.post('/auth/me', auth_Controller.userInfos );


module.exports = router;


module.exports = router;

