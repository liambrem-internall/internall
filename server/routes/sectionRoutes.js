/*
* This file handles the section endpoints
*/


const express = require('express');
const router = express.Router();
const sectionController = require('../controllers/sectionController');

router.post('/', sectionController.createSection); // POST api/sections
router.put('/:id', sectionController.updateSection); // PUT api/sections/:id
router.delete('/:id', sectionController.deleteSection); // DELETE api/sections/:id

module.exports = router;