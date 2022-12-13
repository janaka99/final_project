const Joi = require("joi");

const registerSchema = Joi.object().keys({
  username: Joi.string().min(3).max(50).required(),
  firstName: Joi.string().min(3).max(100).required(),
  lastName: Joi.string().min(3).max(100).required(),
  phoneNumber: Joi.string().min(3).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  province: Joi.string()
    .valid(
      "central",
      "eastern",
      "northern",
      "southern",
      "western",
      "north western",
      "north central",
      "uva",
      "sabaragamuwa"
    )
    .required(),
  district: Joi.string()
    .valid(
      "ampara",
      "anuradhapura",
      "badulla",
      "batticaloa",
      "colombo",
      "galle",
      "gampaha",
      "hambantota",
      "jaffna",
      "kalutara",
      "kandy",
      "kegalle",
      "kilinochchi",
      "kurunegala",
      "mannar",
      "matale",
      "matara",
      "monaragala",
      "mullaitivu",
      "nuwara eliya",
      "polonnaruwa",
      "puttalam",
      "ratnapura",
      "trincomalee",
      "vavuniya"
    )
    .required(),
});

const loginSchema = Joi.object().keys({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const resetPasswordSchema = Joi.object().keys({
  password: Joi.string().min(8).required(),
});

const gigDataValidatiob = Joi.object().keys({
  title: Joi.string().required(),
  description: Joi.string().required(),
  price: Joi.string().required(),
});

const updateAddressSchema = Joi.object().keys({
  address1: Joi.string().min(3).max(100),
  address2: Joi.string().min(3).max(100),
  province: Joi.string()
    .valid(
      "central",
      "eastern",
      "northern",
      "southern",
      "western",
      "north western",
      "north central",
      "uva",
      "sabaragamuwa"
    )
    .required(),
  district: Joi.string()
    .valid(
      "ampara",
      "anuradhapura",
      "badulla",
      "batticaloa",
      "colombo",
      "galle",
      "gampaha",
      "hambantota",
      "jaffna",
      "kalutara",
      "kandy",
      "kegalle",
      "kilinochchi",
      "kurunegala",
      "mannar",
      "matale",
      "matara",
      "monaragala",
      "mullaitivu",
      "nuwara eliya",
      "polonnaruwa",
      "puttalam",
      "ratnapura",
      "trincomalee",
      "vavuniya"
    )
    .required(),
});

const registerEmployeeSchema = Joi.object().keys({
  username: Joi.string().min(3).max(50).required(),
  firstName: Joi.string().min(3).max(100).required(),
  lastName: Joi.string().min(3).max(100).required(),
  phoneNumber: Joi.string().min(3).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});

module.exports = {
  registerSchema,
  loginSchema,
  resetPasswordSchema,
  updateAddressSchema,
  registerEmployeeSchema,
};
