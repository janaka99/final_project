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
    name: "_kU",
    secret: "welesson",
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      // secure: true,
      expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);

app.use(flash());

// requiring routes
const userRoutes = require("./routes/user");
const loginRoutes = require("./routes/login");
const adminRoutes = require("./routes/admin");
const gigRoutes = require("./routes/gig");
const orderRoutes = require("./routes/order");

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
  res.locals.currentUser = req.session.accessToken;
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
app.use("/user", userRoutes);
app.use("/login", loginRoutes);
app.use("/admin", adminRoutes);
app.use("/gig", gigRoutes);
app.use("/order", orderRoutes);

app.get("/gig", (req, res) => {
  res.render("Freelancer/gig");
});

app.get("/gigs", (req, res) => {
  res.render("gigs");
});

app.get("/dashboard", (req, res) => {
  res.render("Freelancer/dashboard");
});

app.listen(3000, () => {
  console.log("Server has started");
});
