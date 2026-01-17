const mongoose = require('mongoose');

const budgetSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User', // 👈 Links this shield to the specific pilot (User)
  },
  category: {
    type: String, // e.g., "food", "salary", "games"
    required: [true, 'Please add a category'],
  },
  limit: {
    type: Number, // e.g., 5000
    required: [true, 'Please add a limit amount'],
  },
}, {
  timestamps: true,
});

// This ensures you can't have TWO shields for "food" at the same time
budgetSchema.index({ user: 1, category: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);