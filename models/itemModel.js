const mongoose = require("mongoose");

const itemSchema = mongoose.Schema(
  {
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      // ref: "categories",
      required: true,
    },

    ItemName: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    count: {
      type: Number,
      required: true,
    },
  },

  { timestamp: true }
);

const Items = mongoose.model("Items", itemSchema);

module.exports = Items;
