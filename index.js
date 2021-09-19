const classNamesGenerator = (...items) => [...items].filter(string => string).join(' ');

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

module.exports = { classNamesGenerator, timeDisplayer };