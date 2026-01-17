const User = require('../models/User');

// @desc    Save/Sync the entire Orbit Dashboard data
// @route   POST /api/data/sync
exports.syncData = async (req, res) => {
  try {
    console.log("📥 Sync Request Received"); // Debug Log

    const user = await User.findById(req.user.id);

    if (user) {
      // 1. Update the data
      user.orbitData = req.body.orbitData || user.orbitData;
      
      // 2. 🔴 CRITICAL FIX: Tell Mongoose the Object changed!
      // Without this, Mongoose might ignore updates to nested objects.
      user.markModified('orbitData');

      // 3. Save
      const updatedUser = await user.save();
      console.log("💾 Data Saved to MongoDB for:", user.email); // Debug Log

      res.json({ orbitData: updatedUser.orbitData });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error("❌ Sync Error:", error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get user data
// @route   GET /api/data/me
exports.getUserData = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    console.log(`📤 Serving data for: ${user.name}`); // Debug Log
    
    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      orbitData: user.orbitData || {}
    });
  } catch (error) {
    console.error("❌ Fetch Error:", error);
    res.status(500).json({ message: 'Server Error' });
  }
};