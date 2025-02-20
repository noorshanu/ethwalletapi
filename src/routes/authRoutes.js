// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { register, login, logout,importWallet,unlock } = require('../controllers/AuthController');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/import', importWallet);
router.post("/unlock", unlock); // New Unlock Route ✅

module.exports = router;