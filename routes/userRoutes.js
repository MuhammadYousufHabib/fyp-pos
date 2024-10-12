const express = require("express");
const {
  loginController,
  registerController,
  logoutController,
} = require("./../controllers/userController");

const router = express.Router();

//routes
//Method - get
router.post("/login", loginController);

router.post("/logout", logoutController);

//MEthod - POST
router.post("/register", registerController);

module.exports = router;
