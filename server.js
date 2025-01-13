const express = require("express");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const cors = require("cors");
const path = require("path");

require("dotenv").config({ path: "./env/.env" });

const app = express();
const PORT = process.env.PORT || 8080;

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

//middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(fileUpload());

// mongodb connection
require("./src/database/connection");

// public routes
app.use("/v1", require("./src/routes/routes"));

// if in production
if (process.env.ENV === "production") {
  app.use(express.static("build"));
  app.get("/*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "build", "index.html"));
  });
}

app.listen(PORT, function () {
  console.log("listening to port ", PORT);
});
