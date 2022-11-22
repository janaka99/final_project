const express = require("express");
const path = require("path");
const app = express();

//Import bodyparse to parse HTML body in a request

//requiring routes

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

//use bodyparser to parse HTML body in a request

//setting the path
app.set("views", path.join(__dirname, "views"));

// setting the view engine
app.set("view engine", "ejs");

//setting up static path
app.use(express.static(__dirname + "/public"));

app.get("/", (req, res) => {
  res.render("home");
});

app.listen(3000, () => {
  console.log("Server has started");
});
