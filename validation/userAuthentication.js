const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) {
    console.log("no token found");
  } else {
    jwt.verify(token, process.env.JSONWEBTOKEN_SECRET, (err, user) => {
      if (err) {
        console.log("error");
      } else {
        req.user = user;
        next();
      }
    });
  }
}

module.exports = { authenticateToken };
