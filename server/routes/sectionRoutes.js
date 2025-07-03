/*
 * This file handles the section endpoints
 */

const express = require("express");
const router = express.Router();
const sectionController = require("../controllers/sectionController");

router.get("/user/:username", sectionController.getSectionsByUsername); // GET /api/sections/user/:username
router.put("/user/:username/order", sectionController.updateSectionOrder); // PUT /api/sections/user/:username/order
router.post("/:username", sectionController.createSection); // POST api/sections
router.put("/:id", sectionController.updateSection); // PUT api/sections/:id
router.delete("/:id/:username", sectionController.deleteSection); // DELETE api/sections/:id

module.exports = router;
