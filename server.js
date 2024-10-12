const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotanv = require("dotenv");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const { bgCyan } = require("colors");
const userModal = require("./models/userModel");
require("colors");
const connectDb = require("./config/config");

//dotenv config
dotanv.config();
//db config
connectDb();
//rest object
const app = express();

//middlwares
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan("dev"));

//routes
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/categories", require("./routes/categoriesRoute"));

app.use("/api", (req, res, next) => {
  // const cookie = req.cookies;
  // const cookies = JSON.stringify(cookie);
  // console.log("cookie from : " + cookies);
  // console.log("cookie from : " + req.cookies);
  console.log("in middlewear");
  console.log("cookie from browser: " + req.cookies.token);

  const token = req.cookies.token;

  try {
    const decoded = jwt.verify(token, process.env.SECRET);

    console.log("decoded: " + JSON.stringify(decoded));
    console.log("decoded: " + new Date(decoded.exp));

    // const now=new Date().getTime()
    // console.log("decoded: " + new Date(now))
    //  if(decoded.expires > now ){
    req.body.decoded = {
      name: decoded.name,
      email: decoded.email,
      isAdmin: decoded.isAdmin,
      _id: decoded._id,
    };
    next();
    //  }
    //  else{
    //     res.status(403).send({message : "Invalid token"})
    //  }
  } catch (err) {
    res.send({ message: "Invalid token" });
    return;
  }
});

app.use("/api/items", require("./routes/itemRoutes"));

app.use("/api/bills", require("./routes/billsRoute"));

// app.use("/api/categories", require("./routes/categoriesRoute"));

app.get("/api/status", async (req, res) => {
  console.log("hello status check");
  console.log("hello the id of user is ", req.body.decoded._id);
  const user = await userModal.findById(req.body.decoded._id);
  console.log("the user is ", user);
  res.status(200).send({ message: "server is up", user });
});

//port
const PORT = process.env.PORT || 8080;

//listen
app.listen(PORT, () => {
  console.log(`Server Running On Port ${PORT}`.bgCyan.white);
});
