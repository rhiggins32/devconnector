const isEmpty = value =>
  value === undefined ||
  value === null ||
  (typeof value === "object" && Object.keys(value).length === 0) ||
  (typeof value === "string" && value.trim().length === 0);

module.exports = isEmpty;

//created this helper method because Validator.isEmpty only checks a string. Errors is an empty object
//could also use isEmpty from lodash
