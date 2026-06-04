const express = require('express');
const { getProfile, updateProfile, triggerSync } = require('../controllers/profileController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

router.get('/', protect, getProfile);
router.put('/', protect, updateProfile);
router.post('/sync', protect, triggerSync);

module.exports = router;
