const router = require("express").Router();
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const {
  registerSchema,
  loginSchema,
  resetPasswordSchema,
} = require("./userValidation");
const { authenticateToken } = require("../validation/userAuthentication");
const Con = require("../connection/mysql");
const jwt = require("jsonwebtoken");
const { sendVerifyEmail, sendResetEmail } = require("../connection/nodemailer");

router.get("/login", (req, res) => {});

router.get("/check", authenticateToken, (req, res) => {
  console.log(req.user);
});

router.post("/login", async (req, res) => {
  try {
    //Get data from HTML request body
    const data = req.body;
    //validate data using Joi validation package
    const value = await loginSchema.validateAsync(data);

    const sqlQuery = "SELECT email,password,username FROM User WHERE email = ?";
    Con.query(sqlQuery, [value.email], async (err, result) => {
      if (err) {
        console.log(err);
      } else {
        if (
          result == null ||
          result.length == 0 ||
          result == undefined ||
          result[0] == null
        ) {
          console.log("Can not find user");
        } else {
          const pwCheck = await bcrypt.compare(
            value.password,
            result[0].password
          );
          console.log(pwCheck);
          if (!pwCheck) {
            console.log("Password not found");
            //       console.log(result[0].username);
            //       const user = {
            //         username: result[0].username,
            //         email: result[0].email,
            //       };
            //       const accessToken = jwt.sign(
            //         user,
            //         process.env.JSONWEBTOKEN_SECRET
            //       );

            //       res.json({ accessToken: accessToken });
          } else {
            console.log("macthed");
          }
          // await bcrypt
          //   .compare(value.password, result[0].password)
          //   .then((match) => {
          //     if (match) {
          //       console.log("user matched");
          //       console.log(result[0].username);
          //       const user = {
          //         username: result[0].username,
          //         email: result[0].email,
          //       };
          //       const accessToken = jwt.sign(
          //         user,
          //         process.env.JSONWEBTOKEN_SECRET
          //       );

          //       res.json({ accessToken: accessToken });
          //     } else {
          //       console.log("user unmatched");
          //     }
          // });
          // (err, rs) => {
          //     if (rs) {

          //     } else {
          //     }
          //   }
          // );
        }
      }
    });
  } catch (error) {
    console.log(error);
  }
});

// Register new user(freelancer)
router.post("/register", async (req, res) => {
  try {
    //Get data from HTML request Body
    const data = req.body;

    //Validate data using Joi validation package
    const value = await registerSchema.validateAsync(data);
    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_SALT_ROUNDS));
    const hashedPassword = await bcrypt.hash(value.password, salt);

    // //create a connection with database
    const sqlQuery =
      "INSERT INTO User(username,firstName,lastName,phoneNumber,email,password) VALUES(?,?,?,?,?,?)";
    Con.query(
      sqlQuery,
      [
        value.username,
        value.firstName,
        value.lastName,
        value.phoneNumber,
        value.email,
        hashedPassword,
      ],
      (err, result) => {
        if (err) {
          console.log(err);
        } else {
          const tk = {
            email: value.email,
            username: value.username,
          };
          const accessToken = jwt.sign(tk, process.env.JSONWEBTOKEN_SECRET);
          sendVerifyEmail(value.email, accessToken);
          const sqlQuery3 = `INSERT INTO verificationTokens(tokenType,token,userId) values("email",'${accessToken}',${result.insertId})`;
          Con.query(sqlQuery3, (err, result) => {
            if (err) {
              console.log(err);
              const sqlQuery4 = `DELETE FROM User WHERE email='${value.email}'`;
              Con.query(sqlQuery4);
            } else {
            }
          });
        }
      }
    );
  } catch (error) {
    //Handle Errors
    console.error(error);
  }
});
router.get("/register", (req, res) => {
  res.render("register");
});
router.post("/login", (req, res) => {
  console.log(req.body);
});

//verify email
router.get("/verifyEmail", async (req, res) => {
  const token = req.query.token;
  console.log("reached ", token);
  if (token) {
    const sqlQuery = `SELECT * FROM verificationTokens WHERE token='${token}'`;
    Con.query(sqlQuery, (err, result) => {
      if (err) {
        throw err;
      } else {
        if (
          result == null ||
          result.length == 0 ||
          result == undefined ||
          result[0] == null
        ) {
          console.log("Email verification failed...");
        } else {
          const sqlquery5 = `UPDATE User SET email_verified=true WHERE id=(select userId from verificationTokens where token='${token}')`;
          Con.query(sqlquery5, (err, result) => {
            if (err) {
              console.log(err);
            } else {
              console.log("Email Verified Successfull");
            }
          });
        }
      }
    });
  } else {
    console.log("no token");
  }
});

//Reset Password
router.get("/forgot-password", async (req, res) => {
  res.render("forgotPassword");
});

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  const sqlquery = "select email,id from User where email='" + email + "'";
  Con.query(sqlquery, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      if (
        result == null ||
        result.length == 0 ||
        result == undefined ||
        result[0] == null
      ) {
        console.log("Email not found");
        //render email not found page
      } else {
        var token = crypto.randomBytes(32).toString("hex");
        const userId = result[0].id;
        const userEmail = result[0].email;
        const accessToken = jwt.sign(token, process.env.JSONWEBTOKEN_SECRET);
        const deleteQuery =
          "delete from verificationTokens where userId='" +
          userId +
          "' and tokenType='passwordreset'";
        Con.query(deleteQuery, (err, result) => {
          if (err) {
            console.log(err);
          } else {
            const sqlQuery3 = `INSERT INTO verificationTokens(tokenType,token,userId) values("passwordreset",'${accessToken}',${userId})`;
            Con.query(sqlQuery3, (err, result) => {
              if (err) {
                console.log(err);
              } else {
                sendResetEmail(email, accessToken);
              }
            });
          }
        });
      }
    }
  });
});

router.get("/reset/reset-password/:token", async (req, res) => {
  const token = req.params.token;
  console.log("reached ", token);
  if (token) {
    const sqlQuery = `SELECT * FROM verificationTokens WHERE token='${token}'`;
    Con.query(sqlQuery, (err, result) => {
      if (err) {
        res.render("404error");
      } else {
        if (
          result == null ||
          result.length == 0 ||
          result == undefined ||
          result[0] == null
        ) {
          res.render("404error");
        } else {
          //render reset password form
          console.log("work for here");
          res.render("Freelancer/resetPassword", { prsToken: token });
        }
      }
    });
  } else {
    res.render("404error");
  }
});

router.post("/reset/reset-password/:token", async (req, res) => {
  const token = req.params.token;
  if (token) {
    const data = req.body;
    const value = await resetPasswordSchema.validate({
      password: data.password,
    });

    if (value.error) {
      console.log(value.error.details[0].message);
      req.flash("error", value.error.details[0].message);
      res.redirect("back");
    } else {
      if (data.password != data.password2) {
        req.flash("error", "Password is not matching");
        res.redirect("back");
      } else {
        const sqlQuery = `SELECT * FROM verificationTokens WHERE token='${token}'`;
        Con.query(sqlQuery, async (err, result) => {
          if (err) {
            throw err;
          } else {
            if (
              result == null ||
              result.length == 0 ||
              result == undefined ||
              result[0] == null
            ) {
              console.log("Email Can not found...");
            } else {
              console.log("query executed");
              //render reset password form
              const salt = await bcrypt.genSalt(
                parseInt(process.env.BCRYPT_SALT_ROUNDS)
              );
              console.log(salt, "asdasd");
              const hashedPassword = await bcrypt.hash(value.password, salt);
              const sqlquery5 = `UPDATE User SET password=? WHERE id=(select userId from verificationTokens where token='${token}' and tokenType='passwordreset' )`;
              Con.query(sqlquery5, [hashedPassword], (err, result) => {
                if (err) {
                  console.log(err);
                } else {
                  req.flash("sucess", "Password reset successful");
                  res.redirect("back");
                }
              });
            }
          }
        });
      }
    }
  } else {
    console.log("no token");
  }
});

module.exports = router;
