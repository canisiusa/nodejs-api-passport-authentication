var express = require('express');
var router = express.Router();

const AuthController = require('../controllers/AuthController')
const auth_Controller = new AuthController()


router.post('/logout', function(req, res, next){
  req.logout()
  next()
},  auth_Controller.revokeTokenSchema, auth_Controller.revokeToken);

router.get('/auth/me', auth_Controller.userInfos );


module.exports = router;

