const router = require("express").Router();
const stripe = require("express")(process.env.STRIPE_SCRET_KEY);
// const Payhere = require("payhere-embed-sdk/dist/embed");
const Con = require("../connection/mysql");
const { isLoggedIn } = require("../middleware");
const { upload } = require("../cloudinary/multer");
const cloudinary = require("../cloudinary/cloudinary");
const fs = require("fs");
var multer = require("multer");

// load order list for user
router.get("/orders/started", isLoggedIn, (req, res) => {
  try {
    const id = req.user.id;
    const query1 =
      "select * from orders where sellerId=" + id + " and status='started'";
    Con.query(query1, (err, result) => {
      if (err) {
        console.log(err);
        res.render("404error");
      } else {
        const orders = result;
        res.render("User/manageStartedOrders", { orders });
      }
    });
  } catch (error) {
    console.log(error);
    res.render("404error");
  }
});

// load order list for user
router.get("/orders/canceled", isLoggedIn, (req, res) => {
  try {
    const id = req.user.id;
    const query1 =
      "select * from orders where sellerId=" + id + " and status='rejected'";
    Con.query(query1, (err, result) => {
      if (err) {
        console.log(err);
        res.render("404error");
      } else {
        const orders = result;
        res.render("User/manageCanceledOrders", { orders });
      }
    });
  } catch (error) {
    console.log(error);
    res.render("404error");
  }
});
// load order list for user
router.get("/orders/completed", isLoggedIn, (req, res) => {
  try {
    const id = req.user.id;
    const query1 =
      "select * from orders where sellerId=" + id + " and status='completed'";
    Con.query(query1, (err, result) => {
      if (err) {
        console.log(err);
        res.render("404error");
      } else {
        const orders = result;

        res.render("User/manageCompletedOrders", { orders });
      }
    });
  } catch (error) {
    console.log(error);
    res.render("404error");
  }
});

// load order list for user
router.get("/orders/delivered", isLoggedIn, (req, res) => {
  try {
    const id = req.user.id;
    const query1 =
      "select * from orders where sellerId=" + id + " and status='delivered'";
    Con.query(query1, (err, result) => {
      if (err) {
        console.log(err);
        res.render("404error");
      } else {
        const orders = result;
        res.render("User/manageDeliveredOrders", { orders });
      }
    });
  } catch (error) {
    console.log(error);
    res.render("404error");
  }
});

//create  order as buyer
router.post("/payment/:id", isLoggedIn, async (req, res) => {
  const userId = req.user.id;
  const gigId = req.params.id;
  try {
    const { key, email, orderDescription } = req.body;
    const query1 = "select * from gig where id=" + gigId + "";
    Con.query(query1, (err, result) => {
      if (err) {
        console.log(err);
      } else {
        const gig = result[0];
        const query2 =
          "insert into orders(sellerId,buyerId,gigId,price,orderDescription,duration) values(?,?,?,?,?,?)";
        Con.query(
          query2,
          [gig.userId, userId, gigId, gig.price, "desc", gig.duration],
          (err, result) => {
            if (err) {
              console.log(err);
            } else {
              Con.query(
                "select pending_clearance from User where id=" +
                  gig.userId +
                  "",
                (err, result) => {
                  if (err) {
                  } else {
                    const rs = result[0].pending_clearance;
                    console.log("Asdas", rs);
                    console.log(gig.price);
                    const newPendingClearance = rs + gig.price;
                    Con.query(
                      "update User set pending_clearance=" +
                        newPendingClearance +
                        " where id=" +
                        gig.userId +
                        ""
                    );
                    res.redirect("/user/profile");
                  }
                }
              );
            }
          }
        );
      }
    });
  } catch (error) {
    console.log(error);
  }
});

// load order list for user
router.get("/my-orders/delivered", isLoggedIn, (req, res) => {
  try {
    const id = req.user.id;
    const query1 =
      "select * from orders where buyerId=" +
      id +
      " and status='started' or status='delivered'";
    Con.query(query1, (err, result) => {
      if (err) {
        console.log(err);
        res.render("404error");
      } else {
        const orders = result;
        res.render("User/myOrdersDelivered", { orders });
      }
    });
  } catch (error) {
    console.log(error);
    res.render("404error");
  }
});

// Complete order as a buyer
router.get("/my-orders/completed", isLoggedIn, (req, res) => {
  try {
    const id = req.user.id;
    const query1 =
      "select * from Orders where buyerId=" + id + " and status='completed'";
    Con.query(query1, (err, result) => {
      if (err) {
        console.log(err);
        res.render("404error");
      } else {
        const orders = result;

        res.render("User/myOrdersCompleted", { orders });
      }
    });
  } catch (error) {
    console.log(error);
    res.render("404error");
  }
});

//Deliver a order:
router.post("/deliver-order/:id", (req, res) => {
  const up = upload.single("orderFile");
  const orderId = req.params.id;
  up(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      req.flash("error", "Something went wrong");
      res.redirect("back");
    } else if (err) {
      req.flash("error", "Something went wrong");
      res.redirect("back");
    } else {
      const files = await req.file;
      const description = req.body.description;
      if (files == undefined || files == null || description == "") {
        req.flash("error", "Something went wrong");
        res.redirect("back");
      } else {
        cloudinary.uploader.upload(files.path, (err, result) => {
          if (err) {
            fs.unlinkSync(files.path);
            req.flash("error", "Something went wrong");
            res.redirect("back");
          } else {
            const pbId = result.public_id;
            const query1 =
              "insert into deliveredImages(orderId,img_url,publicId, description) values(?,?,?,?)";
            Con.query(
              query1,
              [orderId, result.url, result.public_id, description],
              (err, result) => {
                if (err) {
                  console.log(err);
                  req.flash("error", "Something went wrong");
                  res.redirect("back");
                } else {
                  const insertedId = result.insertId;
                  fs.unlinkSync(files.path);
                  const query2 =
                    "update Orders set status='delivered' where id=" +
                    orderId +
                    "";
                  Con.query(query2, (err, result) => {
                    if (err) {
                      console.log(err);
                      cloudinary.uploader.destroy(pbId);
                      Con.query(
                        "delete from  deliveredImages where id=" +
                          insertedId +
                          ""
                      );
                    } else {
                      console.log("delivered");
                    }
                  });
                }
              }
            );
          }
        });
      }
    }
  });
});

//accept order deliverred order as buyer
router.post("/complete-order/:id", isLoggedIn, (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user.id;
    const { rating, description, gigId, price, sellerId } = req.body;

    const query1 =
      "update Orders  set status='completed' , completed_at=CURRENT_TIMESTAMP(6) where id=" +
      orderId +
      "";
    Con.query(query1, (err, result) => {
      if (err) {
        console.log(err);
      } else {
        const query2 =
          "insert into Feedback(buyerId,gigId,orderId,rating,description) values(?,?,?,?,?)";
        Con.query(
          query2,
          [userId, gigId, orderId, rating, description],
          (err, result) => {
            if (err) {
              const query3 =
                "update Orders  set status='delivered' where id=" +
                orderId +
                "";
              Con.query(query3);
              res.redirect("/order/my-orders/delivered");
            } else {
              const feedId = result.insertId;
              Con.query(
                "select pending_clearance, balance from User where id=" +
                  sellerId +
                  "",
                (err, result) => {
                  if (err) {
                    const query3 =
                      "update Orders  set status='delivered' where id=" +
                      orderId +
                      "";
                    Con.query(query3);
                    Con.query("delete from Feedback where id=" + feedId + "");
                    res.redirect("/order/my-orders/delivered");
                  } else {
                    const rs = result[0];
                    const newBalance = rs.balance + price;
                    const newPendingClearance = rs.pending_clearance - price;
                    Con.query(
                      "update User set pending_clearance=" +
                        newPendingClearance +
                        ", balance=" +
                        newBalance +
                        " where id=" +
                        sellerId +
                        ""
                    );

                    res.redirect("/order/my-orders/delivered");
                  }
                }
              );
            }
          }
        );
      }
    });
  } catch (error) {
    console.log(error);
  }
});

//
module.exports = router;
