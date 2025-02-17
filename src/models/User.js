// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  address: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
  privateKey: { type: String, required: true },
  mnemonic: { type: String },
});

module.exports = mongoose.model('User', userSchema);