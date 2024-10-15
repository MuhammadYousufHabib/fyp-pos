const mongoose = require("mongoose");

const categoriesSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

  },
  { timestamp: true }
);

const Categories = mongoose.model("Categories", categoriesSchema);

module.exports = Categories;
