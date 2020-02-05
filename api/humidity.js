const {fetchCurrentWeather} = require('./_utils/fetch-weather-data');

const Units = {
  Imperial: 'imperial',
  Metric: 'metric',
};

module.exports = async (req, res) => {
  try {
    let {units} = req.query;
    if (![...Object.values(Units)].includes(units)) units = Units.Metric;
    const params = {...req.query, units};
    const response = await fetchCurrentWeather(params);
    const {coord: {lat, lon}, main: {humidity}, name} = response;
    const data = {
      humidity: {
        formatted: `${humidity}%`,
        symbol: '%',
        units: 'percent',
        value: humidity,
      },
      lat,
      lon,
      name,
      units,
    };
    res.json(data);
  }
  catch (err) {
    const statusCode = 500;
    res.status(statusCode).end();
  }
};
