// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { register, login, logout,importWallet,unlock, resetPasswordWithMnemonic } = require('../controllers/AuthController');

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/import', importWallet);
router.post("/unlock", unlock); // New Unlock Route ✅
router.post("/reset-password", resetPasswordWithMnemonic); // New route for password reset

module.exports = router;