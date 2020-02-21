const fetch = require('node-fetch');

const fetchCoordinates = async ipAddress => {
  const response = await fetch(`https://ipapi.co/${ipAddress}/json/`);
  if (!response.ok) {
    throw Object.assign(new Error(), {
      message: 'Fetch response not OK',
      name: 'FetchError',
      response,
    });
  }
  const data = await response.json();
  const {latitude: lat, longitude: lon} = data;

  return [lat, lon];
};

module.exports = {fetchCoordinates};
