const express = require('express');
const router = express.Router();
const { syncData, getUserData } = require('../controllers/dataController');
const { protect } = require('../middleware/authMiddleware');

// 'protect' middleware ensures only the owner can see/edit this data
router.get('/me', protect, getUserData);
router.post('/sync', protect, syncData);

module.exports = router;