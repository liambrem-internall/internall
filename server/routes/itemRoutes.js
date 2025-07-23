/*
 * This file handles the item endpoints
 */

const express = require("express");
const router = express.Router();
const itemController = require("../controllers/itemController");

router.get("/:sectionId/items", itemController.getItems); // GET /api/items/:sectionId/items
router.post("/:sectionId/items/:username", itemController.createItem); // POST /api/items/:sectionId/items/:username
router.put("/:sectionId/items/:username/order", itemController.updateItemOrder); // PUT /api/items/:sectionId/items/:username/order
router.put("/:sectionId/items/:itemId/:username/move", itemController.moveItem); // PUT /api/items/:sectionId/items/:itemId/:username/move
router.put("/:sectionId/items/:itemId/:username", itemController.updateItem); // PUT /api/items/:sectionId/items/:itemId/:username
router.delete("/:sectionId/items/:itemId/:username", itemController.deleteItem); // DELETE /api/items/:sectionId/items/:itemId/:username
router.get("/find/:itemId", itemController.findItem); // GET /api/items/find/:itemId

module.exports = router;
