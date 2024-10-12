const userModal = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// login user
const loginController = async (req, res) => {
  if (!req.body?.email || !req.body?.password) {
    res.status(403);
    res.send({
      message: `required parameters missing, 
        example request body:
        {
            email: "abc@example.com",
            password: "password",
            

        } `,
    });
    return;
  }

  req.body.email = req.body.email.toLowerCase();

  try {
    const result = await userModal.findOne({ email: req.body.email });

    if (!result) {
      return res.status(404).send({ message: "User not found." });
    } else {
      const isMatch = await bcrypt.compare(req.body.password, result.password);

      if (isMatch) {
        console.log("THE SEcret is", process.env.SECRET);

        const token = jwt.sign(
          {
            isAdmin: result.isAdmin,
            name: result.name,
            email: req.body.email,
            _id: result._id,
            createdOn: new Date().getTime(),
            // expires: new Date(Date.now() + 86400000).getTime(),
            // expires: new Date(Date.now() + 120000).getTime(),
          },
          process.env.SECRET,
          {
            expiresIn: "24h",
          }
        );

        console.log("token " + token);
        res.cookie("token", token, {
          httpOnly: true,
          secure: true,
          expires: new Date(Date.now() + 86400000),
          //    expires: new Date(Date.now() + 120000)
          // expires: new Date(hours24AfterLoginInMilliSecond)
        });

        res.send({
          message: "Login successfully",
          data: {
            isAdmin: result.isAdmin,
            name: result.name,
            email: req.body.email,
            _id: result._id,
          },
        });
        return;
      } else {
        return res.status(404).send({ message: "Password does not match." });
      }
    }
  } catch (error) {
    console.error("Error occurred while saving user to MongoDB:", error);
    res.status(500).send({ message: "Server error. Please try again later." });
  }

  // try {
  //   const { userId, password } = req.body;
  //   const user = await userModal.findOne({ userId, password, verified: true });
  //   if (user) {
  //     res.status(200).send(user);
  //   } else {
  //     res.json({
  //       message: "Login Fail",
  //       user,
  //     });
  //   }
  // } catch (error) {
  //   console.log(error);
  // }
};

//register
const registerController = async (req, res) => {
  console.log("Request body:", req.body);

  // Check for required fields
  if (!req.body?.name || !req.body?.email || !req.body?.password) {
    res.status(400).send({
      message: `Required parameters missing. 
        Example request body:
        {
            name: "Name",
            email: "abc@example.com",
            password: "password"
        }`,
    });
    return;
  }

  req.body.email = req.body.email.toLowerCase(); // Normalize email

  try {
    // Check if user already exists in the database (case-insensitive)
    const result = await userModal.findOne({ email: req.body.email });

    if (result) {
      // Email already exists
      return res
        .status(409)
        .send({ message: "User already exists for this email address." });
    }

    // Hash password
    const saltRounds = 10;
    const hashPassword = await bcrypt.hash(req.body.password, saltRounds);
    console.log("Hashed password:", hashPassword);

    // Create new user
    const newUser = new userModal({
      isAdmin: false,
      name: req.body.name,
      email: req.body.email,
      password: hashPassword,
      createdOn: new Date(),
      verified: true,
    });

    // Save new user in the database
    await newUser.save();

    // Respond with success message
    res.status(201).send({ message: "User successfully registered!" });
  } catch (err) {
    console.error("Error occurred while saving user to MongoDB:", err);
    res.status(500).send({ message: "Server error. Please try again later." });
  }
};

const logoutController = (req, res) => {
  try {
    res.clearCookie("token");
    res.status(200).send({ message: "Logout Sucessfull" });
  } catch (err) {
    console.log("error in logout api" + err);
  }
};

module.exports = {
  loginController,
  registerController,
  logoutController,
};
