const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');


router.get('/:sectionId/items', itemController.getItems);

router.post('/:sectionId/items', itemController.createItem);

router.put('/:sectionId/items/:itemId', itemController.updateItem);

router.delete('/:sectionId/items/:itemId', itemController.deleteItem);

module.exports = router;