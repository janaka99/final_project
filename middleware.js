const Con = require("./connection/mysql");

module.exports.isLoggedIn = (req, res, next) => {
  if (req.session.accessToken) {
    const user = req.session.accessToken;
    const sqlQuery = "SELECT * FROM User where email=? and id=? and username=?";
    Con.query(sqlQuery, [user.email, user.id, user.username], (err, result) => {
      if (err) {
        req.flash("error", "You must be logged in");
        res.redirect("/user/login");
      } else {
        req.user = result[0];
        next();
      }
    });
  } else {
    req.flash("error", "You must be logged in");
    res.redirect("/user/login");
  }
};

module.exports.isAdmin = (req, res, next) => {
  if (req.session.accessToken) {
    const user = req.session.accessToken;
    const sqlQuery =
      "SELECT * FROM User where email=? and id=? and username=? and role='admin'";
    Con.query(sqlQuery, [user.email, user.id, user.username], (err, result) => {
      if (err) {
        req.flash("error", "You must be logged in");
        res.redirect("/user/login");
      } else {
        req.user = result[0];
        next();
      }
    });
  } else {
    req.flash("error", "You must be logged in");
    res.redirect("/user/login");
  }
};

module.exports.isFreelancer = (req, res, next) => {
  if (req.session.accessToken) {
    const user = req.session.accessToken;
    const sqlQuery =
      "SELECT * FROM User where email=? and id=? and username=? and role='freelancer'";
    Con.query(sqlQuery, [user.email, user.id, user.username], (err, result) => {
      if (err) {
        req.flash("error", "You must be logged in");
        res.redirect("/user/login");
      } else {
        req.user = result[0];
        next();
      }
    });
  } else {
    req.flash("error", "You must be logged in");
    res.redirect("/user/login");
  }
};

module.exports.isEmployee = (req, res, next) => {
  if (req.session.accessToken) {
    const user = req.session.accessToken;
    const sqlQuery =
      "SELECT * FROM User where email=? and id=? and username=? and role='admin' or role='employee'";
    Con.query(sqlQuery, [user.email, user.id, user.username], (err, result) => {
      if (err) {
        req.flash("error", "You must be logged in");
        res.redirect("/user/login");
      } else {
        req.user = result[0];
        next();
      }
    });
  } else {
    req.flash("error", "You must be logged in");
    res.redirect("/user/login");
  }
};
