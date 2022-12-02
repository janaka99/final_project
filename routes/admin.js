const router = require("express").Router();

router.get("/dashboard", (req, res) => {
  res.render("Admin/AdminTemplate");
});

module.exports = router;
