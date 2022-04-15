const classNamesGenerator = (...items) => items.filter(Boolean).join(' ');
const timeDisplayer = (date) => date ? new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";

const getFormValidationErrors = (payload) => {
  const getErrorMessage = ({ text, fields }) => `${text += fields.length > 1 ? "s:" : ":"} ${getFormattedFields(fields)}`;
  const getFormattedFields = (fields) => fields.map((field, index) => `${index > 0 ? ` "${field}"` : `"${field}"`}`);

  const errors = [];
  const emptyFields = [];
  const sideWhiteSpacesFields = [];
  const validString = /^[^\s]+(\s+[^\s]+)*$/;

  Object.entries(payload).forEach(([key, value]) => {
    if (!value || !validString.test(value)) {
      !value ? emptyFields.push(key) : sideWhiteSpacesFields.push(key);
    }
  });

  if (emptyFields.length > 0) {
    errors.push(getErrorMessage({ text: "please send a non empty value for the field", fields: emptyFields }));
  }

  if (sideWhiteSpacesFields.length > 0) {
    errors.push(getErrorMessage({ text: "please remove side white-spaces from the field", fields: sideWhiteSpacesFields }));
  }

  return { errors, message: errors.map((error, index) => index > 0 ? `<br /> ${error}` : error).toString() };
};

module.exports = { classNamesGenerator, timeDisplayer, getFormValidationErrors };