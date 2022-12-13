const nodemailer = require("nodemailer");

var transport = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "freelancerservice211@gmail.com",
    pass: process.env.EMAIL_PASSWORD2,
  },
});

module.exports.sendResetEmail = async (email, token) => {
  var url = "http://localhost:3000/user/reset/reset-password/" + token;
  console.log(url);
  try {
    let info = await transport.sendMail(
      {
        from: "freelancerservice211@gmail.com",
        to: email,
        subject: "Reset-password",
        text: url,
      },
      function (err, res) {
        if (err) {
          console.log(err);
        } else {
          // console.log(res);
        }
      }
    );
    console.log("info ", info);
  } catch (error) {
    console.log(error);
  }
};

module.exports.sendVerifyEmail = async (email, token) => {
  var url = "http://localhost:3000/user/verifyEmail?token=" + token;

  console.log(url);
  try {
    let info = await transport.sendMail(
      {
        from: "freelancerservice211@gmail.com",
        to: email,
        subject: "Verify Your Account",
        text: url,
        html: "<a href=" + url + "> " + url + " </a>",
      },
      function (err, res) {
        if (err) {
          console.log(err);
        } else {
          // console.log(res);
        }
      }
    );
    console.log("info ", info);
  } catch (error) {
    console.log(error);
  }
};
