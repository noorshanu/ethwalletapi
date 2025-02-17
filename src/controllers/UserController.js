// controllers/UserController.js
const User = require('../models/User');

exports.getMe = async (req, res) => {
  // req.userId is set by authMiddleware after verifying JWT
  const user = await User.findById(req.userId).select('-passwordHash');
  if (!user) return res.status(404).json({ error: 'User not found' });

  res.json({
    user: {
      email: user.email,
      address: user.address,
      privateKey: user.privateKey, // again, for demo only
      mnemonic: user.mnemonic,
    },
  });
};