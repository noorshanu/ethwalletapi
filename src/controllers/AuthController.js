// controllers/AuthController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { ethers } = require('ethers');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'MY_SUPER_SECRET';

exports.register = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password is required.' });
    }

    // 1) Generate a random wallet
    const wallet = ethers.Wallet.createRandom();

    // 2) Hash the password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 3) Create a new user
    //    address is from wallet.address
    //    privateKey, mnemonic from the generated wallet
    const newUser = new User({
      address: wallet.address, 
      passwordHash,
      privateKey: wallet.privateKey,
      mnemonic: wallet.mnemonic.phrase, 
    });

    await newUser.save();

    // 4) Generate a JWT (if you want to keep user logged in)
    const token = jwt.sign({ userId: newUser._id }, JWT_SECRET, { expiresIn: '1d' });

    // Return the newly created wallet info
    // The user can copy the privateKey or mnemonic
    return res.json({
      message: 'Wallet created successfully',
      token,
      user: {
        address: newUser.address,
        privateKey: newUser.privateKey,
        mnemonic: newUser.mnemonic,
      },
    });
  } catch (error) {
    console.error('signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { address, password } = req.body;

    if (!address || !password) {
      return res.status(400).json({ error: 'Address and password are required.' });
    }

    // 1) Find user by address
    const user = await User.findOne({ address });
    if (!user) {
      return res.status(401).json({ error: 'User not found.' });
    }

    // 2) Compare password
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid password.' });
    }

    // 3) Sign a JWT (if you want persistent login)
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1d' });

    return res.json({
      message: 'Login successful',
      token,
      user: {
        address: user.address,
        privateKey: user.privateKey,
        mnemonic: user.mnemonic,
      },
    });
  } catch (error) {
    console.error('login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.logout = async (req, res) => {
  // For JWT, typically you just remove the token on the client side.
  // We'll just return a message here.
  return res.json({ message: 'Logout successful' });
};

exports.importWallet = async (req, res) => {
  try {
    const { email, password, privateKey, mnemonic } = req.body;

    // 1) Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Must have either privateKey or mnemonic
    if (!privateKey && !mnemonic) {
      return res.status(400).json({ error: 'Provide either privateKey or mnemonic.' });
    }

    // 2) Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // Option A: Return error
      // return res.status(400).json({ error: 'User already exists' });
      
      // Option B: If you'd like to update the wallet instead, you can do so here.
      // For now, let's just return error to keep it consistent with "one user per email".
      return res.status(400).json({ error: 'User already exists' });
    }

    // 3) Parse the wallet using ethers
    let wallet;
    try {
      if (privateKey) {
        wallet = new ethers.Wallet(privateKey.trim());
      } else if (mnemonic) {
        // For ethers v6: "Wallet.fromPhrase(mnemonic)"
        // For ethers v5: "ethers.Wallet.fromMnemonic(mnemonic)"
        wallet = ethers.Wallet.fromPhrase(mnemonic.trim());
      }
    } catch (err) {
      return res.status(400).json({ error: 'Invalid private key or mnemonic' });
    }

    // 4) Hash the password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 5) Create the new user
    const newUser = new User({
      email,
      passwordHash,
      address: wallet.address,
      privateKey: wallet.privateKey, // plain text for demo only!
      mnemonic: wallet.mnemonic?.phrase || '', 
    });

    await newUser.save();

    // 6) Sign a JWT
    const token = jwt.sign({ userId: newUser._id }, JWT_SECRET, { expiresIn: '1d' });

    return res.json({
      message: 'Wallet imported & user created',
      token,
      user: {
        email: newUser.email,
        address: newUser.address,
        privateKey: newUser.privateKey,
        mnemonic: newUser.mnemonic,
      },
    });
  } catch (error) {
    console.error('importWallet error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.unlock = async (req, res) => {
  try {
    console.log("Unlock request received:", req.body); // ✅ Debug log

    const { address, password } = req.body;

    if (!address || !password) {
      return res.status(400).json({ error: "Address and password are required." });
    }

    const user = await User.findOne({ address });
    if (!user) {
      return res.status(401).json({ error: "User not found." });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid password." });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "1d" });

    console.log("Unlock successful:", { address: user.address }); // ✅ Debug log

    return res.json({
      message: "Wallet unlocked successfully",
      token,
      user: {
        address: user.address,
        privateKey: user.privateKey, // ⚠️ Keep secure in production!
        mnemonic: user.mnemonic,
      },
    });
  } catch (error) {
    console.error("Unlock error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};