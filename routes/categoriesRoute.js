const express = require("express");
const {
  addCategoriesController,
  getCategoriesController,
  editCategoriesController,
  deleteCategoriesController,
} = require("../controllers/categoriesController");

const router = express.Router();

//routes

router.get("/get-categories", getCategoriesController);

//MEthod - POST
router.post("/add-categories", addCategoriesController);

//method - PUT
router.put("/edit-categories/:categoryId", editCategoriesController);

//method - DELETE
router.post("/delete-categories/:categoryId", deleteCategoriesController);

module.exports = router;
