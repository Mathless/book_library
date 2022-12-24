const express = require("express");
const path = require("path");
const app = express();
const https = require("https");
const fs = require("fs");
const cors = require("cors");
const { Server } = require("socket.io");
const winston = require("winston");
const expressWinston = require("express-winston");
const whitelist = ["https://localhost:4200", "https://localhost:3000", "https://www.piesocket.com"];

app.use(
  expressWinston.logger({
    transports: [new winston.transports.Console()],
    format: winston.format.combine(winston.format.colorize(), winston.format.json()),
    meta: true, // optional: control whether you want to log the meta data about the request (default to true)
    msg: "HTTP {{req.method}} {{req.url}}", // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
    expressFormat: true, // Use the default Express/morgan request formatting. Enabling this will override any msg if true. Will only output colors with colorize set to true
    colorize: false, // Color the text and status code, using the Express/morgan color palette (text: gray, status: default green, 3XX cyan, 4XX yellow, 5XX red).
    ignoreRoute: function (req, res) {
      return false;
    }, // optional: allows to skip some log messages based on request and/or response
  })
);

app.use(express.json());
app.use(express.static(path.join(__dirname, "../dist/")));
app.set("views", "../src/views");
app.set("view engine", "pug");
app.use(
  cors({
    origin: "https://localhost:4200",
    credentials: true,
    optionSuccessStatus: 200,
  })
);
const routerLab3 = require("./router");
app.use(function (req, res, next) {
  // Website you wish to allow to connect
  res.setHeader("Access-Control-Allow-Origin", "https://localhost:4200");

  // Request methods you wish to allow
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");

  // Request headers you wish to allow
  res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type");

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader("Access-Control-Allow-Credentials", true);

  // Pass to next layer of middleware
  next();
});

app.use("/", routerLab3);

const server = https.createServer(
  {
    key: fs.readFileSync("key.pem"),
    cert: fs.readFileSync("cert.pem"),
  },
  app
);

const io = new Server(server, {
  cors: {
    origin: "https://localhost:4200",
    credentials: true,
  },
});
require("./router.lab4")(app, io);

const currentUsers = {};
const currenPairs = {};

server.listen(3000, () => {
  console.log("serever is runing at port 3000");
});
module.exports = server;
