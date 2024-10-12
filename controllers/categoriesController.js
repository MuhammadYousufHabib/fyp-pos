const categoriesModel = require("../models/categoriesModel");

const addCategoriesController = async (req, res) => {
  try {
    const newItem = new categoriesModel(req.body);
    await newItem.save();
    res.status(201).send("Category Created Successfully");
  } catch (error) {
    res.status(400).send(error.message || "Error creating category");
    console.log(error);
  }
};

const getCategoriesController = async (req, res) => {
  try {
    const categories = await categoriesModel.find();
    res.status(200).send(categories);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};

// update item
const editCategoriesController = async (req, res) => {
  try {
    const { categoryId } = req.params;
    console.log(categoryId);
    await categoriesModel.findOneAndUpdate({ _id: categoryId }, req.body, {
      new: true,
    });
    res.status(200).json("Item Updated");
  } catch (error) {
    res.status(400).send(error.message || "Error updating item");
    console.log(error);
  }
};

// delete item
const deleteCategoriesController = async (req, res) => {
  try {
    const { categoryId } = req.params;
    console.log(categoryId);
    await categoriesModel.findOneAndDelete({ _id: categoryId });
    res.status(200).json("Item Deleted");
  } catch (error) {
    res.status(400).send(error.message || "Error deleting item");
    console.log(error);
  }
};

module.exports = {
  addCategoriesController,
  getCategoriesController,
  editCategoriesController,
  deleteCategoriesController,
};
