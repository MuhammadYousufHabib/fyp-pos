const mongoose = require("mongoose");

const itemSchema = mongoose.Schema(
  {
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "categories",
      required: true,
    },
    categoryName: {
      type: String,
      required: true,
    },
    item : []
    // item : [
    //   {
    //       name: {
    //         type: String,
    //         required: true,
    //       },
    //       price: {
    //         type: Number,
    //         required: true,
    //       },
    //       image: {
    //         type: String,
    //         required: true,
    //       },
    //     },
    // ]

  },
 
  { timestamp: true }
);

const Items = mongoose.model("Items", itemSchema);

module.exports = Items;
