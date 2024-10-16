const express = require("express");
const {
  getItemController,
  addItemController,
  editItemController,
  deleteItemController,
  editItemInventoryController
} = require("./../controllers/itemController");

const router = express.Router();

//routes
//Method - get
router.get("/get-item", getItemController);

//MEthod - POST
router.post("/add-item", addItemController);

router.put("/edit-count", editItemInventoryController);

//method - PUT
router.put("/edit-item", editItemController);

//method - DELETE
router.post("/delete-item", deleteItemController);

module.exports = router;
