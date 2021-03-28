const authorize = require('middleware/authorize')
var express = require('express');
var router = express.Router();

const Role = require('helpers/role');

const UserController = require('../controllers/userController')
const user_Controller = new UserController()


router.get('/', authorize(Role.Admin), user_Controller.getAll);
router.get('/:id', authorize(Role.Admin), user_Controller.getById);
router.post('/', authorize(Role.Admin), user_Controller.createSchema, user_Controller.create);
router.put('/:id', authorize(Role.Admin), user_Controller.updateSchema, user_Controller.update);
router.delete('/:id', authorize(Role.Admin), user_Controller._delete);