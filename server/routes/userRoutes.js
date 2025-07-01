/*
* This file handles the user endpoints
*/


const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/', userController.getCurrentUser); // GET /api/users
router.get('/:username/sections', userController.getSectionsByUsername); // GET /api/users/:username/sections
router.put('/:username/sections/order', userController.updateSectionOrder); // PUT /api/users/:username/sections/order
router.post('/', userController.createUser); // POST /api/users
router.put('/:id', userController.updateUser); // PUT /api/users/:id
router.delete('/:id', userController.deleteUser); // DELETE /api/users/:id

module.exports = router;