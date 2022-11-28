const express = require("express");
const path = require("path");
const flash = require("connect-flash");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const app = express();
require("dotenv").config();

//Import bodyparse to parse HTML body in a request
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set(express.json());

app.use(
  session({
    secret: "welesson",
    cookie: { maxAge: 6000 },
    saveUninitialized: false,
    resave: false,
  })
);

app.use(flash());

// requiring routes
const userRoutes = require("./routes/user");

//create mysql connection
// const db = mysql.createConnection({
//   host: "",
//   user: "",
//   password: "",
// });

//connect to mysql
// db.connect((err) => {
//   if (err) {
//     throw err;
//   }
//   console.log("database connected");
// });

app.use(function (req, res, next) {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

//setting the path
app.set("views", path.join(__dirname, "views"));

// setting the view engine
app.set("view engine", "ejs");

//setting up static path
app.use(express.static(__dirname + "/Public"));

app.get("/", (req, res) => {
  res.render("home");
});
app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/gig", (req, res) => {
  res.render("Freelancer/gig");
});
app.get("/gig", (req, res) => {
  res.render("Freelancer/free");
});
app.get("/admin", (req, res) => {
  res.render("Admin/adminTemplate");
});

app.use("/user/", userRoutes);

app.listen(3000, () => {
  console.log("Server has started");
});
