const getRandomInt =
  (max = 1, min = 0) => Math.floor(Math.random() * (max - min + 1)) + min;

module.exports = (req, res) => {
  const maxInt = 100;
  res.send(getRandomInt(maxInt));
};
