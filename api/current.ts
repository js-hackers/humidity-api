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
  country: string;
  dt: number;
  feels_like: number;
  humidity: number;
  lat: number;
  lon: number;
  name: string;
  sunrise: number;
  sunset: number;
  temp_max: number;
  temp_min: number;
  temp: number;
  timezone: number;
  units: Units;
  weather: WeatherCondition[];
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

    const {
      coord: {lat, lon},
      dt,
      main: {feels_like, humidity, temp, temp_max, temp_min},
      name,
      sys: {country, sunrise, sunset},
      timezone,
      weather,
    } = await fetchCurrentWeather(params);

    const data = {
      country,
      dt,
      feels_like,
      humidity,
      lat,
      lon,
      name,
      sunrise,
      sunset,
      temp,
      temp_max,
      temp_min,
      timezone,
      units,
      weather,
    };

    res.json(data);
  }
  catch (err) {
    const statusCode = 500;
    res.status(statusCode).end();
  }
};
