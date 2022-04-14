const classNamesGenerator = (...items) => items.filter(Boolean).join(' ');
const timeDisplayer = (date) => date ? new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";

const getFormValidationErrors = (payload) => {
  const isOnlyOneField = (fields) => getInvalidFields(fields).length === 1;
  const getInvalidFields = (fields) => fields.map((field, index) => `${index > 0 ? ` ${field}` : field}`);
  const formatMessage = (message, fields) => `${message += isOnlyOneField(fields) ? ":" : "s:"} ${getInvalidFields(fields)}`;

  let errors = "";
  const emptyFields = [];
  const sideWhiteSpacesFields = [];
  const validString = /^[^\s]+(\s+[^\s]+)*$/;

  Object.entries(payload).forEach(([key, value]) => {
    if (!value || !validString.test(value)) {
      !value ? emptyFields.push(key) : sideWhiteSpacesFields.push(key);
    }
  });

  if (emptyFields.length > 0) {
    errors = formatMessage("please send a non empty value for the field", emptyFields);
  }

  if (sideWhiteSpacesFields.length > 0) {
    const message = formatMessage("please remove side white-spaces from the field", sideWhiteSpacesFields);
    const isPreviousErrors = errors.length > 0;
    errors += isPreviousErrors ? `<br /> ${message}` : message;
  }

  return errors;
};

module.exports = { classNamesGenerator, timeDisplayer, getFormValidationErrors };