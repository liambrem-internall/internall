/*
 * This file handles the search endpoints
 */

const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');

router.get("/search", searchController.search);
router.post("/:id/accessed", searchController.accessSearch);
router.post("/web-accessed", searchController.webAccessed);

module.exports = router;