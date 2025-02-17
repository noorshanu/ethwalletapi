// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController');
const authMiddleware = require('../middleware/auth');

router.get('/me', authMiddleware, userController.getMe);

module.exports = router;