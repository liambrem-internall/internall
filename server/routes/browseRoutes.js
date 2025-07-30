const express = require('express');
const router = express.Router();
const browseController = require('../controllers/browseController');

router.get('/users', browseController.getAllUsers); // GET /api/browse/users
router.get('/:username', browseController.getUserBoard); // GET /api/browse/:username


module.exports = router;