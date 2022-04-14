const classNamesGenerator = (...items) => [...items].filter(item => item).join(' ');

// To do: maybe remove it and use the new date functions in js instead
const timeDisplayer = (date) => {
  let time = "";

  const handleEdgeCases = (timePart) => {
    return timePart = timePart < 10 ? `0${timePart}` : timePart;
  };

  if (date) {
    let hours = new Date(date).getHours();
    let minutes = new Date(date).getMinutes();
    hours = handleEdgeCases(hours);
    minutes = handleEdgeCases(minutes);
    time = `${hours}:${minutes}`;
  }

  return time;
};

const getErrors = (payload) => {
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

module.exports = { classNamesGenerator, timeDisplayer, getErrors };