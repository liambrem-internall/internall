/*
 * This file handles the search endpoints
 */

const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');

router.get("/webSearch", searchController.webSearch);

module.exports = router;