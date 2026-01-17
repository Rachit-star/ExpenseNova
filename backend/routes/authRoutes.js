const express = require('express');
const router = express.Router();
const { registerUser, loginUser, forgotPassword, resetPassword,getUserCount } = require('../controllers/authController');
router.post('/signup', registerUser);
router.post('/login', loginUser);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resetToken', resetPassword);
router.get('/count', getUserCount);

module.exports = router;