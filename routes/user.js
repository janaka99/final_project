const router = require("express").Router();
const bcrypt = require("bcrypt");
const fs = require("fs");
const crypto = require("crypto");
const {
  registerSchema,
  loginSchema,
  resetPasswordSchema,
  updateAddressSchema,
} = require("./userValidation");
const { authenticateToken } = require("../validation/userAuthentication");
const Con = require("../connection/mysql");
const jwt = require("jsonwebtoken");
const { sendVerifyEmail, sendResetEmail } = require("../connection/nodemailer");
const { isLoggedIn } = require("../middleware");
const Joi = require("joi");
const { upload } = require("../cloudinary/multer");
const cloudinary = require("../cloudinary/cloudinary");
var multer = require("multer");
const { fstat } = require("fs");

router.get("/home", isLoggedIn, (req, res) => {
  const id = req.user.id;
  const query1 = "select * from User where id=" + id + "";
  Con.query(query1, (err, results) => {
    if (err) {
      res.redirect("/");
    } else {
      let last31DayEarnings = 0;
      const query2 =
        "select sum(price) from Orders where status='completed' and sellerId=" +
        id +
        "";
      Con.query(query2, (err, results) => {
        if (err) {
          res.redirect("/");
        } else {
          if (results == null) {
            res.render("user/Home", {
              userDetails: results[0],
              last31DayEarnings,
            });
          } else {
            last31DayEarnings = results;
            res.render("user/Home", {
              userDetails: results[0],
              last31DayEarnings,
            });
          }
        }
      });
    }
  });
});

router.get("/login", (req, res) => {
  if (!req.session.accessToken) {
    res.render("login");
  } else {
    res.redirect("back");
  }
});
router.get("/logout", (req, res) => {
  req.session.accessToken = null;
  req.session.user = null;
  res.redirect("/");
});
router.post("/login", async (req, res) => {
  try {
    //Get data from HTML request body
    const data = req.body;

    //validate data using Joi validation package
    const value = await loginSchema.validateAsync(data);

    const sqlQuery =
      "SELECT User.email, User.password, User.username,User.id , p.img_url as img_url FROM User left join profilePictures as p on p.userId=User.id  WHERE email = ? and email_verified=true";
    Con.query(sqlQuery, [value.email], async (err, result) => {
      if (err) {
        console.log(err);
        req.flash("error", "Username or password is incorrect");
        res.redirect("back");
      } else {
        if (
          result == null ||
          result.length == 0 ||
          result == undefined ||
          result[0] == null
        ) {
          console.log(result);
          req.flash("error", "Username or password is incorrect");

          res.redirect("back");
        } else {
          const pwCheck = await bcrypt.compare(
            value.password,
            result[0].password
          );
          console.log(pwCheck);
          if (!pwCheck) {
            req.flash("error", "Username or password is incorrect");

            res.redirect("back");
          } else {
            console.log("macthed");
            const user = {
              username: result[0].username,
              email: result[0].email,
              id: result[0].id,
              img_url: result[0].img_url,
            };
            // const accessToken = jwt.sign(user, process.env.JSONWEBTOKEN_SECRET);
            req.session.accessToken = user;
            res.redirect("/");
          }
        }
      }
    });
  } catch (error) {
    req.flash("error", "Username or password is incorrect");

    res.redirect("back");
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
      "INSERT INTO User(username,firstName,lastName,phoneNumber,email,password,province,district) VALUES(?,?,?,?,?,?,?,?)";
    Con.query(
      sqlQuery,
      [
        value.username,
        value.firstName,
        value.lastName,
        value.phoneNumber,
        value.email,
        hashedPassword,
        value.province,
        value.district,
      ],
      (err, result) => {
        if (err) {
          req.flash("error", "Check all the fields and try again");
          res.redirect("back");
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
              req.flash("error", "Check all the fields and try again");
              res.redirect("back");
            } else {
              req.flash("success", "Please verify your email and login");
              res.redirect("/");
            }
          });
        }
      }
    );
  } catch (error) {
    //Handle Errors
    if (error.details[0].message) {
      console.error();
      req.flash("error", error.details[0].message);
      res.redirect("back");
    } else {
      console.error(error);
      req.flash("error", "Check all the fields and try again");
      res.redirect("back");
    }
  }
});
router.get("/register", (req, res) => {
  res.render("register");
});

//load your profile
router.get("/profile", isLoggedIn, (req, res) => {
  const id = req.user.id;
  const query1 =
    "select User.username, User.bio, User.district, User.description ,year(User.created_at) as year,month(User.created_at) as month, profilePictures.img_url from User left join profilePictures on profilePictures.userId=?";
  Con.query(query1, [id], (err, result) => {
    if (err) {
      console.log(err);
      res.render("404error");
    } else {
      const profile = result[0];
      const query2 =
        "select   gig.title, gig.description, gig.price, gig.id,gigImages.img_url from gig inner join gigImages where " +
        "gigImages.gigId=gig.id and gigImages.id=(select id from gigImages where gigId=gig.id limit 1) and gig.userId=? ";

      Con.query(query2, [id], (err, result) => {
        if (err) {
          console.log("wer ", err);
          res.render("404error");
        } else {
          const gigs = result;
          console.log(gigs);
          res.render("User/profile", { profile, gigs });
        }
      });
    }
  });
});

//verify email
router.get("/verifyEmail", async (req, res) => {
  const token = req.query.token;
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
          res.render("404error");
        } else {
          const sqlquery5 = `UPDATE User SET email_verified=true WHERE id=(select userId from verificationTokens where token='${token}')`;
          Con.query(sqlquery5, (err, result) => {
            if (err) {
              res.render("404error");
            } else {
              req.flash("success", "Email Succussfully verified! Please login");
              res.redirect("/user/login");
            }
          });
        }
      }
    });
  } else {
    res.render("404error");
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
        req.flash("error", "Email not Registered");
        res.redirect("back");
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
            req.flash("error", "Something went wrong try again");
            res.redirect("back");
          } else {
            const sqlQuery3 = `INSERT INTO verificationTokens(tokenType,token,userId) values("passwordreset",'${accessToken}',${userId})`;
            Con.query(sqlQuery3, (err, result) => {
              if (err) {
                req.flash("error", "Something went wrong try again");
                res.redirect("back");
              } else {
                sendResetEmail(email, accessToken);
                req.flash(
                  "success",
                  "Password reset email successfully sent to your email"
                );
                res.redirect("back");
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
    console.log(value);
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
              const salt = await bcrypt.genSalt(
                parseInt(process.env.BCRYPT_SALT_ROUNDS)
              );
              const hashedPassword = await bcrypt.hash(
                value.value.password,
                salt
              );
              console.log("hashed ", hashedPassword);
              const sqlquery5 = `UPDATE User SET password=? WHERE id=(select userId from verificationTokens where token='${token}' and tokenType='passwordreset' )`;
              Con.query(sqlquery5, [hashedPassword], (err, result) => {
                if (err) {
                  req.flash("error", "Something went wrong, please try again!");
                  res.redirect("back");
                } else {
                  const sqlQuery6 = `DELETE FROM verificationTokens WHERE token='${token}' and tokenType='passwordreset'`;
                  Con.query(sqlQuery6);
                  req.flash("sucess", "Password reset successful Please Login");
                  res.render("login");
                }
              });
            }
          }
        });
      }
    }
  } else {
    res.render("404error");
  }
});

//////////user profile///////////////////////////////////////////////////

router.get("/settings", isLoggedIn, async (req, res) => {
  const user = await req.user;
  res.render("User/settings", { user });
});

router.post(
  "/settings/update-bio-description",
  isLoggedIn,
  async (req, res) => {
    const user = await req.user;
    const { bio, description } = req.body;
    try {
      const value = Joi.object().keys({
        bio: Joi.string().min(20).max(100).required(),
        description: Joi.string().min(100).max(768).required(),
      });
      const result = value.validate({ bio, description });
      if (result.error) {
        req.flash("error", result.error.message);
        res.redirect("back");
      } else {
        var query1 = "UPDATE User SET bio=? , description=? WHERE id=?";
        Con.query(
          query1,
          [result.value.bio, result.value.description, user.id],
          (err, result) => {
            if (err) {
              console.log(err);
              req.flash("error", "Something went wrong try again");
              res.redirect("user/settings");
            } else {
              console.log(result);

              req.flash("success", "SuccessFully Updated");
              res.redirect("user/settings");
            }
          }
        );
      }
    } catch (error) {
      req.flash("error", "Something went wrong try again");
      res.redirect("back");
    }
  }
);

router.post(
  "/settings/update-user-name-details",
  isLoggedIn,
  async (req, res) => {
    const user = await req.user;
    const { username, firstName, lastName } = req.body;
    try {
      const value = Joi.object().keys({
        username: Joi.string().min(1).max(50).required(),
        firstName: Joi.string().min(1).max(100).required(),
        lastName: Joi.string().min(1).max(100).required(),
      });
      const joiResult = value.validate({ username, firstName, lastName });
      if (joiResult.error) {
        req.flash("error", joiResult.error.message);
        res.redirect("back");
      } else {
        var query1 = "SELECT username FROM User where username=?";
        Con.query(query1, [joiResult.value.username], (err, result) => {
          if (err) {
            console.log(err);
            req.flash("error", "Something went wrong try again");
            res.redirect("back");
          } else {
            if (result.length > 0) {
              req.flash("error", "Username Already Taken");
              res.redirect("back");
            } else {
              var query1 =
                "UPDATE User SET username=? ,firstName=?, lastName=? WHERE id=?";
              Con.query(
                query1,
                [
                  joiResult.value.username,
                  joiResult.value.firstName,
                  joiResult.value.lastName,
                  user.id,
                ],
                (err, result) => {
                  if (err) {
                    console.log(err);
                    req.flash("error", "Something went wrong try again");
                    res.redirect("back");
                  } else {
                    console.log(result);
                    req.session.accessToken = null;
                    req.flash(
                      "success",
                      "SuccessFully Updated! Please Login again"
                    );
                    res.redirect("/user/login");
                  }
                }
              );
            }
          }
        });
      }
    } catch (error) {
      console.log(error);
      req.flash("error", "Something went wrong try again");
      res.redirect("back");
    }
  }
);

router.post(
  "/settings/update-address-details",
  isLoggedIn,
  async (req, res) => {
    const user = await req.user;
    const { province, district, address1, address2 } = req.body;
    console.log(province, district, address1, address2);
    try {
      const value = await updateAddressSchema.validateAsync({
        address1,
        address2,
        province,
        district,
      });
      console.log(value.address1);
      if (value.error) {
        req.flash("error", joiResult.error.message);
        res.redirect("back");
      } else {
        var query1 =
          "UPDATE User SET address1=? ,address2=?, province=? , district=? WHERE id=?";
        Con.query(
          query1,
          [
            value.address1,
            value.address2,
            value.province,
            value.district,
            user.id,
          ],
          (err, result) => {
            if (err) {
              console.log(err);
              req.flash("error", "Something went wrong try again");
              res.redirect("back");
            } else {
              console.log(result);
              req.flash("success", "SuccessFully Updated! Please Login again");
              res.redirect("back");
            }
          }
        );
      }
    } catch (error) {
      console.log(error);
      req.flash("error", "Something went wrong try again");
      res.redirect("back");
    }
  }
);

router.post("/settings/change-online-status", isLoggedIn, (req, res) => {
  const user = req.user;
  const { online_status } = req.body;
  let status = null;
  if (online_status === "true") {
    status = true;
  } else if (online_status === "false") {
    status = false;
  }
  if (status === null) {
    req.flash("error", "Something went wrong try again");
    res.redirect("back");
  } else {
    Con.query(
      "UPDATE User set online_status=" + status + " where id=" + user.id + "",
      (err, result) => {
        if (err) {
          console.log(err);
          req.flash("error", "Something went wrong try again");
          res.redirect("back");
        } else {
          req.flash("success", "SuccessFully Updated");
          res.redirect("back");
        }
      }
    );
  }
});

router.post("/settings/update-profile-picture", isLoggedIn, (req, res) => {
  const user = req.user.id;
  try {
    const up = upload.single("image");
    console.log("reached");
    up(req, res, async (err) => {
      if (err instanceof multer.MulterError) {
        req.flash("error", "Something went wrong try again");
        res.redirect("back");
      } else {
        const files = await req.file;
        if (files <= 0) {
          req.flash("error", "Image not found. Please upload image");
          res.redirect("back");
        } else if (files > 1) {
          req.flash("error", "Image not found. Please upload image");
          res.redirect("back");
        } else {
          const query =
            "select * from profilePictures where userId=" + user + ";";
          Con.query(query, async (err, results) => {
            if (err) {
              req.flash("error", "Something went wrong try again");
              res.redirect("back");
            } else {
              console.log(results.length);
              if (results.length == 1) {
                cloudinary.uploader.destroy(results[0].publicId);
              }
              const result = await cloudinary.uploader.upload(files.path);
              // const files = req.files
              console.log(result);
              const newPath = result.url;
              const publicID = result.public_id;
              fs.unlinkSync(files.path);
              const query2 =
                "INSERT INTO profilePictures(publicId, userId,img_url) values(?,?,?)";
              Con.query(query2, [publicID, user, newPath], (err, result) => {
                if (err) {
                  console.log(err);
                  req.flash("error", "Something went wrong try again");
                  res.redirect("back");
                } else {
                  req.flash("error", "Profile picture update successfull");
                  res.redirect("back");
                }
              });
            }
          });
        }
      }
    });
  } catch (error) {
    console.log("Asd ", error);
  }
});

//load your profile
router.get("/freelacer/profile/:id", (req, res) => {
  const id = req.params.id;
  console.log(id);
  const query1 =
    "select User.username, User.bio, User.district, User.description ,year(User.created_at) as year,month(User.created_at) as month, profilePictures.img_url from User left join profilePictures on profilePictures.userId=?";
  Con.query(query1, [id], (err, result) => {
    if (err) {
      console.log(err);
      res.render("404error");
    } else {
      const profile = result[0];
      const query2 =
        "select   gig.title, gig.description, gig.price, gig.id,gigImages.img_url from gig inner join gigImages where " +
        "gigImages.gigId=gig.id and gigImages.id=(select id from gigImages where gigId=gig.id limit 1) and gig.userId=? and gig.status='approved'";

      Con.query(query2, [id], (err, result) => {
        if (err) {
          console.log("wer ", err);
          res.render("404error");
        } else {
          const gigs = result;
          console.log(gigs);
          res.render("User/profile", { profile, gigs });
        }
      });
    }
  });
});

module.exports = router;
