const router = require("express").Router();
const Con = require("../connection/mysql");
const { sendVerifyEmail, sendResetEmail } = require("../connection/nodemailer");
const { registerEmployeeSchema } = require("./userValidation");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
// admin home
router.get("/dashboard", (req, res) => {
  res.render("Admin/Home");
});

// arender add new employee page
router.get("/dashboard/add-new-employee", (req, res) => {
  res.render("Admin/AddNewEmployee");
});

// register new empployee
router.post("/dashboard/add-new-employee", async (req, res) => {
  try {
    //Get data from HTML request Body
    const data = req.body;

    //Validate data using Joi validation package
    const value = await registerEmployeeSchema.validateAsync(data);
    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_SALT_ROUNDS));
    const hashedPassword = await bcrypt.hash(value.password, salt);

    // //create a connection with database
    const sqlQuery =
      "INSERT INTO User(username,firstName,lastName,phoneNumber,email,password,role) VALUES(?,?,?,?,?,?,'employee')";
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
    // if (error.details[0].message) {
    //   console.error(error.details[0].message);
    // } else {
    //   console.error(error);
    // }
    console.log(error);
  }
});

// manage employees
router.get("/dashboard/manage-employees", (req, res) => {
  Con.query(
    "select username, id ,role  from User where role='employee' or role='admin'",
    (err, result) => {
      if (err) {
        console.log(err);
        res.redirect("/admin/dashboard");
      } else {
        const employees = result;
        res.render("Admin/AdminTemplate", { employees });
      }
    }
  );
});

// RENDER GIGS FOR APPROVAL ( PENDING)
router.get("/dashboard/pending-gig-approvals", (req, res) => {
  Con.query(
    "select title, id  from gig where status='pending'",
    (err, result) => {
      if (err) {
        const gig = {
          title: "",
          id: "",
        };
        res.redirect("/");
      } else {
        const gigs = result;
        res.render("Admin/gigApprovals", { gigs });
      }
    }
  );
});
// RENDER ACTIVE GIGS
router.get("/dashboard/active-gigs", (req, res) => {
  Con.query(
    "select title, id  from gig where status='approved'",
    (err, result) => {
      if (err) {
        const gig = {
          title: "",
          id: "",
        };
        res.redirect("/");
      } else {
        const gigs = result;
        res.render("Admin/ApprovedGigs", { gigs });
      }
    }
  );
});
// RENDER REJECTED GIGS
router.get("/dashboard/rejected-gigs", (req, res) => {
  Con.query(
    "select title, id  from gig where status='disapproved'",
    (err, result) => {
      if (err) {
        const gig = {
          title: "",
          id: "",
        };
        res.redirect("/");
      } else {
        const gigs = result;
        res.render("Admin/DisApprovedGigs", { gigs });
      }
    }
  );
});

/// view pending gig
router.get("/dashboard/pending-gig-approvals/pending/:id", (req, res) => {
  const id = req.params.id;
  Con.query(
    "select title, description,price,id,status  from gig where status='pending' and id=" +
      id +
      ";",
    (err, result) => {
      if (err) {
        res.redirect("admin/dashboard/pending-gig-approvals");
      } else {
        const gig = result[0];
        res.render("Admin/gigApprovalView", { gig });
      }
    }
  );
});

/// view aprroved gig
router.get("/dashboard/pending-gig-approvals/approved/:id", (req, res) => {
  const id = req.params.id;
  Con.query(
    "select title, description,price,id,status  from gig where status='approved' and id=" +
      id +
      ";",
    (err, result) => {
      if (err) {
        res.redirect("admin/dashboard/active-gigs");
      } else {
        const gig = result[0];
        res.render("Admin/gigApprovalView", { gig });
      }
    }
  );
});

/// view rejected gig
router.get("/dashboard/pending-gig-approvals/rejected/:id", (req, res) => {
  const id = req.params.id;
  Con.query(
    "select title, description,price,id,status  from gig where status='disapproved' and id=" +
      id +
      ";",
    (err, result) => {
      if (err) {
        res.redirect("admin/dashboard/rejected-gigs");
      } else {
        const gig = result[0];
        res.render("Admin/gigApprovalView", { gig });
      }
    }
  );
});

/// Approve gig
router.post("/dashboard/pending-gig-approvals/approve/:gigID", (req, res) => {
  const gigID = req.params.gigID;

  if (gigID == null || gigID == undefined) {
    res.render("404error");
  } else {
    const query1 = "update gig set status='approved' where id=" + gigID + ";";
    Con.query(query1, [], (err, result) => {
      if (err) {
        req.flash("error", "System error try again!");
        res.redirect("back");
      } else {
        req.flash("success", "SuccessFully approved!");
        res.redirect("/admin/dashboard/pending-gig-approvals");
      }
    });
  }
});

/// Dis Approve gig
router.post(
  "/dashboard/pending-gig-approvals/disApprove/:gigID",
  (req, res) => {
    const gigID = req.params.gigID;
    if (gigID == null || gigID == undefined) {
      res.render("404error");
    } else {
      const query1 =
        "update gig set status='disapproved' where id=" + gigID + ";";
      Con.query(query1, [], (err, result) => {
        if (err) {
          req.flash("error", "System error try again!");
          res.redirect("back");
        } else {
          req.flash("success", "SuccessFully approved!");
          res.redirect("/admin/dashboard/pending-gig-approvals");
        }
      });
    }
  }
);

module.exports = router;
