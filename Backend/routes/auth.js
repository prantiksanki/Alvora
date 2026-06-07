const express = require('express');
const { signup, login, updateMe } = require('../controllers/authController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.put('/me', protect, updateMe);

module.exports = router;
