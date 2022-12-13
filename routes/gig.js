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

router.get("/find", async (req, res) => {
  let searchQuery = req.body.searchQuery;
  if (searchQuery === undefined || searchQuery == "") {
    Con.query("select * from gig where status='approved'", (err, result) => {
      if (err) {
        res.redirect("/");
      } else {
        res.render("gigs", { gigs: result });
      }
    });
  } else {
    var queries = await searchQuery.split(" ");
    console.log(queries.length);
    let string = " ";
    for (let i = 0; i < queries.length; i++) {
      if (i == 0) {
        string = string.concat(" (title LIKE '%" + queries[i] + "%' ) ");
      } else {
        string = string.concat(" or (title LIKE '%" + queries[i] + "%' ) ");
      }
    }
    const sqlQuery =
      "select * from gig where (" + string + " ) and status='approved'";
    console.log(sqlQuery, (err, results) => {
      if (err) {
        console.log(err);
        res.redirect("/");
      } else {
        res.render("gigs", { gigs: result });
      }
    });
  }
  // Con.query();
});

router.post(
  "/add-new-gig",
  isLoggedIn,

  async (req, res) => {
    try {
      const up = upload.array("image", 3);
      up(req, res, async (err) => {
        if (err instanceof multer.MulterError) {
          req.flash("error", err.message);
          res.redirect("back");
        } else if (err) {
          req.flash("error", err.message);
          res.redirect("back");
        } else {
          const error = false;
          if (req.files.length <= 0) {
            error = true;
            req.flash("error", "Upload portoflio images");
            res.redirect("back");
          }
          if (req.body.price == "") {
            error = true;
            req.flash("error", "Price Cannot be empty");
            res.redirect("back");
          } else if (Number(req.body.price) == NaN) {
            error = true;
            req.flash("error", "Price is not valid");
            res.redirect("back");
          }
          if (req.body.title == "") {
            error = true;
            req.flash("error", "Title Cannot be empty");
            res.redirect("back");
          }
          if (req.body.description == "") {
            error = true;
            req.flash("error", "Description Cannot be empty");
            res.redirect("back");
          }
          if (error == true) {
            req.flash("error", "fille all the fields");
            res.redirect("back");
          } else {
            const files = await req.files;
            const urls = [];
            const nprice = Number(req.body.price);
            const sqlQuery1 =
              "INSERT INTO gig(title,description,price,userId) values(?,?,?,?)";
            Con.query(
              sqlQuery1,
              [req.body.title, req.body.description, nprice, req.user.id],
              async (err, result) => {
                if (err) {
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
                          console.log(err);
                          cloudinary.uploader.destroy(publicId);
                          const deleteQuery = "DELETE FROM gig WHERE id=?";
                          Con.query(deleteQuery, [gigID]);
                          req.flash("success", "Gig add Successfull");
                          console.log("Something went wrong try again later");
                        }
                      }
                    );
                  }
                  req.flash("success", "Gig add Successfull");
                  res.redirect("back");
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
    }
  }
);

router.get("/add-new-gig", isLoggedIn, (req, res) => {
  res.render("gig/addnewgig");
});

router.get("/view/:id", (req, res) => {
  const gigId = req.params.id;
  if (gigId == null || gigId === undefined) {
    res.render("404error");
  } else {
    Con.query(
      "SELECT gig.title, gig.price,gig.userId,gig.id, gig.description , User.username, profilePictures.img_url from gig inner join User  on User.id=gig.userId inner join profilePictures on profilePictures.userId=gig.userId where gig.id=" +
        gigId +
        ";",
      (err, result) => {
        if (err) {
          res.render("404error");
        } else {
          const gigData = result[0];
          console.log(gigData);
          Con.query(
            "SELECT * FROM gigImages where gigId=" + gigId + ";",
            (err, result) => {
              if (err) {
                res.render("404error");
              } else {
                const gigImages = result;
                Con.query(
                  "select date(F.created_at) as d ,F.rating,F.description , U.username , P.img_url from Feedback as F join User as U inner join profilePictures as P  where F.buyerId=U.id and gigId=" +
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
                      console.log(result);
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

module.exports = router;
