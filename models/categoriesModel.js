const mongoose = require("mongoose");

const categoriesSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    // slug: {
    //   type: String,
    //   required: true,
    //   unique: true,
    // },
    // description: {
    //   type: String,
    // },
    // image: {
    //   type: String,
    //   required: true,
    // },
  },
  { timestamp: true }
);

const Categories = mongoose.model("Categories", categoriesSchema);

module.exports = Categories;
