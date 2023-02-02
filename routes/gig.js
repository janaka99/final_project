const router = require("express").Router();
const formidable = require("formidable");
const path = require("path");
var multer = require("multer");
const { upload } = require("../cloudinary/multer");
const cloudinary = require("../cloudinary/cloudinary");
// var cloudinary = require("cloudinary").v2;
const fs = require("fs");
const { Console } = require("console");
const { isLoggedIn } = require("../middleware");
const Con = require("../connection/mysql");
const DateFormat = require("fast-date-format");
// var upload = multer({ storage });

router.post("/find", async (req, res) => {
  let searchQuery = await req.body.searchQuery;
  console.log(searchQuery);
  if (searchQuery === undefined || searchQuery == "") {
    Con.query(
      "select  gig.* , gigImages.img_url as p_url,User.id as Uid, User.username as username,profilePictures.img_url as img_url  " +
        "from gig left join User on User.id=gig.userId left join profilePictures on profilePictures.userId=gig.Userid left join gigImages on gigImages.gigId=gig.id where gigImages.id=(select id from gigImages where gigId=gig.id limit 1) and" +
        "  gig.status='approved'",
      (err, result) => {
        if (err) {
          console.log(err);
          res.redirect("/");
        } else {
          console.log("rs ", result);
          res.render("gigs", { gigs: result });
        }
      }
    );
  } else {
    var queries = await searchQuery.split(" ");
    console.log(queries.length);
    let string = " ";
    for (let i = 0; i < queries.length; i++) {
      if (i == 0) {
        string = string.concat(" (gig.title LIKE '%" + queries[i] + "%' ) ");
      } else {
        string = string.concat(" or (gig.title LIKE '%" + queries[i] + "%' ) ");
      }
    }
    console.log(string);
    const sqlQuery =
      "select  gig.* , gigImages.img_url as p_url,User.id as Uid, User.username as username,profilePictures.img_url as img_url " +
      "from gig left join User on User.id=gig.userId left outer join profilePictures on profilePictures.userId=gig.Userid left outer join gigImages on gigImages.gigId=gig.id where gigImages.id=(select id from gigImages where gigId=gig.id limit 1) and (" +
      string +
      " ) and gig.status='approved'   limit 20";
    Con.query(sqlQuery, (err, results) => {
      if (err) {
        console.log(err);
        res.redirect("/");
      } else {
        console.log(results);
        res.render("gigs", { gigs: results });
      }
    });
  }
  // Con.query();
});

router.post("/find/:id", async (req, res) => {
  let searchQuery = await req.body.searchQuery;
  console.log(searchQuery);
  if (searchQuery === undefined || searchQuery == "") {
    Con.query(
      "select  gig.* , gigImages.img_url as p_url, User.username as username,profilePictures.img_url as img_url  " +
        "from gig inner join User inner join profilePictures inner join gigImages where  gig.status='approved' and profilePictures.userId=User.id and gigImages.id=(select id from gigImages limit 1) limit 20",
      (err, result) => {
        if (err) {
          console.log(err);
          res.redirect("/");
        } else {
          res.render("gigs", { gigs: result });
        }
      }
    );
  } else {
    var queries = await searchQuery.split(" ");
    console.log(queries.length);
    let string = " ";
    for (let i = 0; i < queries.length; i++) {
      if (i == 0) {
        string = string.concat(" (gig.title LIKE '%" + queries[i] + "%' ) ");
      } else {
        string = string.concat(" or (gig.title LIKE '%" + queries[i] + "%' ) ");
      }
    }
    const sqlQuery =
      "select  gig.* , gigImages.img_url as p_url, User.username as username,profilePictures.img_url as img_url  " +
      "from gig inner join User inner join profilePictures inner join gigImages where (" +
      string +
      " ) and gig.status='approved' and profilePictures.userId=User.id and gigImages.id=(select id from gigImages limit 1) limit 20";
    Con.query(sqlQuery, (err, results) => {
      if (err) {
        console.log(err);
        res.redirect("/");
      } else {
        res.render("gigs", { gigs: results });
      }
    });
  }
  // Con.query();
});

const deleteLocalDatabaseImages = () => {
  fs.readdir("uploads", (err, files) => {
    if (err) console.log(err);
    for (const file of files) {
      fs.unlink(path.join("uploads", file), (err) => {
        if (err) console.log("error 1 ", err);
      });
    }
  });
};

router.post(
  "/add-new-gig",
  isLoggedIn,

  async (req, res) => {
    try {
      const up = upload.array("image", 3);
      up(req, res, async (err) => {
        if (err instanceof multer.MulterError) {
          console.log("1");
          req.flash("error", err.message);
          res.redirect("back");
          return;
        } else if (err) {
          console.log("2");

          req.flash("error", err.message);
          res.redirect("back");
          return;
        } else {
          console.log("3");

          let error = false;
          if (req.files.length <= 0) {
            error = true;
            req.flash("error", "Upload portoflio images");
            res.redirect("back");
            return;
          }
          if (req.body.price == "") {
            console.log("5");

            error = true;
            req.flash("error", "Price Cannot be empty");
            res.redirect("back");
            deleteLocalDatabaseImages();
            return;
          } else if (Number(req.body.price) == NaN) {
            error = true;
            req.flash("error", "Price is not valid");
            res.redirect("back");
            deleteLocalDatabaseImages();

            return;
          }
          if (req.body.title == "") {
            error = true;
            req.flash("error", "Title Cannot be empty");
            res.redirect("back");
            deleteLocalDatabaseImages();

            return;
          }
          if (req.body.description == "") {
            error = true;
            req.flash("error", "Description Cannot be empty");
            res.redirect("back");
            deleteLocalDatabaseImages();

            return;
          }
          if (error == true) {
            req.flash("error", "fill all the fields");
            res.redirect("back");
            deleteLocalDatabaseImages();

            return;
          } else {
            console.log("9");

            const files = await req.files;
            const urls = [];
            const nprice = Number(req.body.price);
            const sqlQuery1 =
              "INSERT INTO gig(title,description,price,userId,duration) values(?,?,?,?,?)";
            Con.query(
              sqlQuery1,
              [
                req.body.title,
                req.body.description,
                nprice,
                req.user.id,
                req.body.duration,
              ],
              async (err, result) => {
                if (err) {
                  console.log(err);
                  if (err)
                    if (
                      err.sqlMessage ===
                      "PROCEDURE freelancingfinal.Error: You can only have 3 gigs does not exist"
                    ) {
                      req.flash("error", "You can only have 3 Gigs");
                      res.redirect("back");
                    } else {
                      req.flash(
                        "error",
                        "Something Went wrong Try again later"
                      );
                      res.redirect("back");
                    }

                  for (const file of files) {
                    fs.unlinkSync(file.path);
                  }
                } else {
                  console.log("work for here");
                  const gigID = result.insertId;
                  let rrrr = false;
                  for (const file of files) {
                    const { path } = file;
                    const result = await cloudinary.uploader.upload(path);
                    const newPath = result.url;
                    const publicId = result.public_id;
                    fs.unlinkSync(path);
                    const sqlQuery2 =
                      "INSERT INTO gigImages(img_url, publicId,  gigId) values(?,?,?)";
                    Con.query(
                      sqlQuery2,
                      [newPath, publicId, gigID],
                      (err, result) => {
                        if (err) {
                          rrrr = true;
                          console.log(err);
                          cloudinary.uploader.destroy(publicId);
                          const deleteQuery = "DELETE FROM gig WHERE id=?";
                          Con.query(deleteQuery, [gigID]);
                        }
                      }
                    );
                  }
                  if (rrrr == true) {
                    req.flash("error", "Something went wrong try again later");
                    res.redirect("back");
                  } else {
                    req.flash("success", "Gig add Successfull!!");
                    res.redirect("/user/profile");
                  }
                }
              }
            );
          }
        }
      });
    } catch (error) {
      console.log(error);
      fs.readdir("uploads", (err, files) => {
        if (err) console.log(err);
        for (const file of files) {
          fs.unlink(path.join("uploads", file), (err) => {
            if (err) console.log("error 1 ", err);
          });
        }
      });
      req.flash("error", "Something went wrong Please try again!");
      res.redirect("back");
    }
  }
);

router.get("/add-new-gig", isLoggedIn, (req, res) => {
  res.render("gig/addnewgig");
});

const getRemainDays = (createdAt, duration) => {
  const nowTime = new Date();

  let createdTime = new Date(createdAt);
  const createdD = new Date(createdAt);

  createdTime = createdTime.setDate(createdTime.getDate() + duration);
  var dDate = new Date(createdTime);
  console.log(createdTime, "   ", createdD);

  var differece = (nowTime.getTime() - createdD.getTime()) / 1000;

  var days = Math.floor(differece / 86400);
  differece -= days * 86400;

  var hours = Math.floor(differece / 3600) % 24;
  differece -= hours * 3600;

  var minutes = Math.floor(differece / 60) % 60;
  differece -= minutes * 60;

  console.log(days, " ", hours, " ", minutes);
};

router.get("/view/:id", (req, res) => {
  const gigId = req.params.id;
  if (gigId == null || gigId === undefined) {
    res.render("404error");
  } else {
    Con.query(
      "SELECT count(Feedback.id) as F_count, gig.title, gig.price,gig.userId,gig.id, gig.description , User.username, profilePictures.img_url from gig left outer join User  on User.id=gig.userId left outer join Feedback on Feedback.gigId=gig.id left outer join profilePictures on profilePictures.userId=gig.userId where gig.id=" +
        gigId +
        ";",
      (err, result) => {
        if (err) {
          res.render("404error");
        } else {
          const gigData = result[0];

          Con.query(
            "SELECT * FROM gigImages where gigId=" + gigId + ";",
            (err, result) => {
              if (err) {
                res.render("404error");
              } else {
                const gigImages = result;
                Con.query(
                  "select year(F.created_at) as y ,month(F.created_at) as m ,day(F.created_at) as d ,F.rating,F.description , U.username , P.img_url from Feedback as F join User as U on F.buyerId=U.id inner join profilePictures as P on P.userId=F.buyerId where F.buyerId=U.id and gigId=" +
                    gigId +
                    "",
                  (err, result) => {
                    if (err) {
                      res.render("gig/view", {
                        gigImages,
                        gigData,
                        pbKey: process.env.PUBLISHABLE_KEY,
                        feedbacks: null,
                      });
                    } else {
                      res.render("gig/view", {
                        gigImages,
                        gigData,
                        pbKey: process.env.PUBLISHABLE_KEY,
                        feedbacks: result,
                      });
                    }
                  }
                );
              }
            }
          );
        }
      }
    );
  }
});

router.get("/preview/:id", (req, res) => {
  const gigId = req.params.id;
  if (gigId == null || gigId === undefined) {
    res.render("404error");
  } else {
    Con.query(
      "SELECT gig.title, gig.price,gig.userId,gig.id, gig.description , profilePictures.img_url from gig left outer join profilePictures on profilePictures.userId=gig.userId where gig.id=" +
        gigId +
        ";",
      (err, result) => {
        if (err) {
          res.render("404error");
        } else {
          const gigData = result[0];

          Con.query(
            "SELECT * FROM gigImages where gigId=" + gigId + ";",
            (err, result) => {
              if (err) {
                res.render("404error");
              } else {
                const gigImages = result;
                res.render("gig/EditGig", {
                  gigImages,
                  gigData,
                });
              }
            }
          );
        }
      }
    );
  }
});

router.get("/see/all-gigs", isLoggedIn, (req, res) => {
  const id = req.user.id;
  Con.query(
    "select title, id,status  from gig where userId=" + id,
    (err, result) => {
      if (err) {
        const gig = {
          title: "",
          id: "",
        };
        res.redirect("/");
      } else {
        const gigs = result;
        res.render("User/allGigs", { gigs });
      }
    }
  );
});

router.post("/delete/:id", isLoggedIn, (req, res) => {
  try {
    const gigId = req.params.id;
    const user = req.user.id;
    console.log(gigId, user);
    //remember to delete gig images from cloudinary
    Con.query("alter table gig where gigId=" + gigId + " and userId=" + user);

    res.redirect("back");
  } catch (error) {
    req.flash("error", "Something went wrong");
    res.redirect("back");
  }
});

router.post("/update-gig-details/:id", isLoggedIn, (req, res) => {
  const gigId = req.params.id;
  const useId = req.user.id;
  if (req.body.price == "") {
    req.flash("error", "Price Cannot be empty");
    res.redirect("back");

    return;
  } else if (Number(req.body.price) == NaN) {
    req.flash("error", "Price is not valid");
    res.redirect("back");

    return;
  }
  if (req.body.title == "") {
    req.flash("error", "Title Cannot be empty");
    res.redirect("back");

    return;
  }
  if (req.body.description == "") {
    req.flash("error", "Description Cannot be empty");
    res.redirect("back");

    return;
  }
  const nprice = Number(req.body.price);

  Con.query(
    "update gig set title=?, description=?, price=? where userId=? and id=?",
    [req.body.title, req.body.description, nprice, useId, gigId],
    (err, result) => {
      if (err) {
        req.flash("error", "Something went wrong try again ");
        res.redirect("back");
      } else {
        req.flash("success", "successfully updated ");
        res.redirect(`/gig/view/${gigId}`);
      }
    }
  );
});

module.exports = router;
