export const timeDisplayer = (date) => date ? new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";

export const getFormValidationErrors = (payload) => {
  const errors = [];
  const emptyFields = [];
  const sideWhiteSpacesFields = [];
  const validString = /^[^\s]+(\s+[^\s]+)*$/;

  for (const [formField, formValue] of Object.entries(payload)) {
    if (formValue && validString.test(formValue)) continue;
    !formValue ? emptyFields.push(formField) : sideWhiteSpacesFields.push(formField);
  }

  if (emptyFields.length > 0) {
    errors.push(getErrorMessage({ text: "please send a non empty value for the field", fields: emptyFields }));
  }

  if (sideWhiteSpacesFields.length > 0) {
    errors.push(getErrorMessage({ text: "please remove side white-spaces from the field", fields: sideWhiteSpacesFields }));
  }

  return { errors, message: errors.map((error, index) => index > 0 ? `<br /> ${error}` : error).toString() };
};

const getErrorMessage = ({ text, fields }) =>
  getMessagePrefix({ text, isSingleField: fields.length === 1 }) + " " + getFormattedFields(fields);

const getMessagePrefix = ({ text, isSingleField }) => `${text += isSingleField ? ":" : "s:"}`;
const getFormattedFields = (fields) => fields.map(field => `"${field}"`).join(", ");