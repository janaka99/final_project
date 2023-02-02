const mysql = require("mysql");

// var Con = mysql.createConnection({
//   host: process.env.DATABASE_HOST,
//   user: process.env.DATABASE_USER,
//   password: process.env.DATABASE_PASSWORD,
//   port: process.env.DATABASE_PORT,
//   database: process.env.DATABASE_NAME,
// });

var Con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  port: "3306",
  database: "freelancingfinal",
});

Con.connect((err) => {
  console.log(err);
});

module.exports = Con;
