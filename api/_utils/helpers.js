const isDay = weatherData => !(
  weatherData.dt < weatherData.sunrise
  || weatherData.dt >= weatherData.sunset
);

const padTimeUnit = n => {
  const two = 2;
  return typeof n === 'number'
    ? String(n).padStart(two, '0')
    : '00';
};

const getHMS = date => {
  const h = date.getUTCHours();
  const m = date.getUTCMinutes();
  const s = date.getUTCSeconds();
  return [h, m, s];
};

const get12Hour = h => {
  const twelve = 12;
  const getHour = h => {
    if (h > twelve) return h % twelve;
    if (h === 0) return twelve;
    return h;
  };
  const h12 = getHour(h);
  return [h12, h >= twelve];
};

const getTimes = weatherData => {
  const {dt, sunrise, sunset, timezone} = weatherData;

  const getTime = unixSeconds => {
    const msPerS = 1000;
    const adjustedSeconds = unixSeconds + timezone;
    const date = new Date(adjustedSeconds * msPerS);
    const [h, m, s] = getHMS(date);
    const [h12, pm] = get12Hour(h);
    return {
      formatted: `${padTimeUnit(h)}:${padTimeUnit(m)}`,
      h12: {
        formatted: `${h12}:${padTimeUnit(m)}`,
        hms: [h12, m, s],
        pm,
      },
      hms: [h, m, s],
    };
  };

  return {
    dt: getTime(dt),
    sunrise: getTime(sunrise),
    sunset: getTime(sunset),
  };
};

module.exports = {
  getTimes,
  isDay,
  padTimeUnit,
};
