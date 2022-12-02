const router = require("express").Router();
const formidable = require("formidable");
var multer = require("multer");
const { upload } = require("../cloudinary/multer");
const cloudinary = require("../cloudinary/cloudinary");
const fs = require("fs");

// var upload = multer({ storage });

var multipleUploads = upload.fields([{ name: "image1" }, { name: "image2" }]);

router.post("/add-new-gig", upload.array("image"), async (req, res) => {
  try {
    const uploader = async (path) => await cloudinary.uploads(path, "Images");
    const urls = [];
    const files = req.files;
    console.log(req.files);
    for (const file of files) {
      //   const { path } = file;
      console.log("asds", file);
      //   const newPath = await uploader(path);
      //   console.log(newPath);
      //   urls.push(newPath);

      //   fs.unlinkSync(path);
    }

    console.log("file upload successfull");
  } catch (error) {}
});

router.get("/add-new-gig", (req, res) => {
  res.render("gig/addnewgig");
});

module.exports = router;
