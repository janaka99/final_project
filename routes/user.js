const router = require("express").Router();

router.post("/login", (req, res) => {
  console.log(req.body);
});
router.get("/login", (req, res) => {
  res.render("login");
});
router.post("/register", (req, res) => {
  console.log(req.body);
});

router.post("/login", (req, res) => {
  console.log(req.body);
});

module.exports = router;
