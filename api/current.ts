import {fetchCurrentWeather, OWMParams, WeatherCondition} from './_utils/open-weather-api';
import {NowRequest, NowResponse} from '@now/node';
import {fetchCoordinates} from './_utils/location-api';

export {WeatherCondition} from './_utils/open-weather-api';

export enum Units {
  Imperial = 'imperial',
  Metric = 'metric',
  Standard = 'standard',
}

export type CurrentWeatherData = {
  clouds_all: number;
  country: string;
  dt: number;
  humidity: number;
  lat: number;
  lon: number;
  name: string;
  pressure: number;
  rain_1h: number;
  rain_3h: number;
  snow_1h: number;
  snow_3h: number;
  sunrise: number;
  sunset: number;
  temp: number;
  temp_feels_like: number;
  temp_max: number;
  temp_min: number;
  timezone: number;
  units: Units;
  weather: WeatherCondition[];
  wind_deg: number;
  wind_speed: number;
};

export default async (req: NowRequest, res: NowResponse): Promise<void> => {
  try {
    let unitsInput: string;

    if (Array.isArray(req.query.units)) unitsInput = req.query.units[0];
    else unitsInput = req.query.units;

    let units = Units.Metric;
    const unitsList: string[] = [...Object.values(Units)];

    if (unitsList.includes(unitsInput)) units = unitsInput as Units;

    const params: OWMParams = {...req.query, units};

    if (!params.zip && !params.q && !params.lat && !params.lon) {
      const ipAddress = req.headers['x-forwarded-for'];
      if (typeof ipAddress !== 'string') {
        throw new Error('No location data available');
      }
      const [lat, lon] = await fetchCoordinates(ipAddress);
      [params.lat, params.lon] = [String(lat), String(lon)];
    }

    const responseData = await fetchCurrentWeather(params);

    const data: CurrentWeatherData = {
      clouds_all: responseData.clouds.all,
      country: responseData.sys.country,
      dt: responseData.dt,
      humidity: responseData.main.humidity,
      lat: responseData.coord.lat,
      lon: responseData.coord.lon,
      name: responseData.name,
      pressure: responseData.main.pressure,
      rain_1h: (responseData.rain && responseData.rain['1h']) || 0,
      rain_3h: (responseData.rain && responseData.rain['3h']) || 0,
      snow_1h: (responseData.snow && responseData.snow['1h']) || 0,
      snow_3h: (responseData.snow && responseData.snow['3h']) || 0,
      sunrise: responseData.sys.sunrise,
      sunset: responseData.sys.sunset,
      temp: responseData.main.temp,
      temp_feels_like: responseData.main.feels_like,
      temp_max: responseData.main.temp_max,
      temp_min: responseData.main.temp_min,
      timezone: responseData.timezone,
      units,
      weather: responseData.weather,
      wind_deg: responseData.wind.deg,
      wind_speed: responseData.wind.speed,
    };

    res.json(data);
  }
  catch (err) {
    const statusCode = 500;
    res.status(statusCode).end();
  }
};
