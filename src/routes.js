const express = require('express');
const rescue = require('express-rescue');

const router = express.Router();

const loginController = require('./controllers/login.controller');
const userController = require('./controllers/user.controller');

const middlewares = require('./middlewares');

router.post('/login', middlewares.validateLogin, rescue(loginController.login));
router.post('/user', middlewares.validateFields, rescue(userController.setUser));
router.get('/user', middlewares.authMiddleware, rescue(userController.getUsers));
router.get('/user/:id', middlewares.authMiddleware, rescue(userController.getUserById));

module.exports = router;