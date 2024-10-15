const itemModel = require("../models/itemModel");

// get items
const getItemController = async (req, res) => {
  try {
    const items = await itemModel.find();
    res.status(200).send(items);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};

// add items
const addItemController = async (req, res) => {
  try {
    const {ItemName} = req.body;
    console.log(ItemName);
    console.log(req.body);
    const itemFound = await itemModel.findOne({ItemName});
    console.log("the item which found ",itemFound);
    if (!itemFound) {
    const newItem = new itemModel(req.body);
    await newItem.save();
    console.log(newItem);
    return res.status(201).send("Item Created Successfully !");
    }
    else{
      console.log("Item already exist");
     return res.status(400).send("Item already exist");
    }
  
  
 

} catch (error) {
    res.status(400).send(error.message || "Error creating item");
    console.log(error);
  }
};

// update item
const editItemController = async (req, res) => {
  try {
    const { itemId } = req.body;
    console.log(itemId);
    await itemModel.findOneAndUpdate({ _id: itemId }, req.body, {
      new: true,
    });
    res.status(200).json("Item Updated");
  } catch (error) {
    res.status(400).send(error.message || "Error updating item");
    console.log(error);
  }
};

// delete item
const deleteItemController = async (req, res) => {
  try {
    const { itemId } = req.body;
    console.log(itemId);
    await itemModel.findOneAndDelete({ _id: itemId });
    res.status(200).json("Item Deleted");
  } catch (error) {
    res.status(400).send(error.message || "Error deleting item");
    console.log(error);
  }
};

module.exports = {
  getItemController,
  addItemController,
  editItemController,
  deleteItemController,
};
