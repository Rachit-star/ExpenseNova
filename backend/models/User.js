const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  orbitData: { type: Object, default: {} },
  
  // 🟢 ADD THESE 2 LINES:
  resetPasswordToken: String,
  resetPasswordExpire: Date,

}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);