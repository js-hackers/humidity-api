import {CurrentWeatherData} from '../current';

export const isDay = (weatherData: CurrentWeatherData): boolean => (
  weatherData.dt >= weatherData.sunrise
  && weatherData.dt < weatherData.sunset
);

export const padTimeUnit = (n: number): string => {
  const two = 2;
  return typeof n === 'number'
    ? String(n).padStart(two, '0')
    : '00';
};

const getHMS = (date: Date): [number, number, number] => {
  const h = date.getUTCHours();
  const m = date.getUTCMinutes();
  const s = date.getUTCSeconds();
  return [h, m, s];
};

const get12Hour = (h: number): [number, boolean] => {
  const twelve = 12;
  const getHour = (h: number): number => {
    if (h > twelve) return h % twelve;
    if (h === 0) return twelve;
    return h;
  };
  const h12 = getHour(h);
  return [h12, h >= twelve];
};

type TimeData = {
  formatted: string;
  h12: {
    formatted: string;
    hms: [number, number, number];
    pm: boolean;
  };
  hms: [number, number, number];
};

export const getTimes = (weatherData: CurrentWeatherData): {
  dt: TimeData;
  sunrise: TimeData;
  sunset: TimeData;
} => {
  const {dt, sunrise, sunset, timezone} = weatherData;

  const getTime = (unixSeconds: number): TimeData => {
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
