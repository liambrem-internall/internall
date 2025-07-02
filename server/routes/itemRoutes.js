/*
 * This file handles the item endpoints
 */

const express = require("express");
const router = express.Router();
const itemController = require("../controllers/itemController");

router.get("/:sectionId/items", itemController.getItems); // GET api/items/:sectionId/items
router.post("/:sectionId/items", itemController.createItem); // POST api/items/:sectionId/items
router.put("/:sectionId/items/order", itemController.updateItemOrder); // PUT api/items/:sectionId/items/order
router.put("/:sectionId/items/:itemId", itemController.updateItem); // PUT api/items/:sectionId/items/:itemId
router.delete("/:sectionId/items/:itemId", itemController.deleteItem); // DELETE api/items/:sectionId/items/:itemId

module.exports = router;
