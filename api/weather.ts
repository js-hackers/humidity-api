import {NowRequest, NowResponse} from '@now/node';
import {fetchCoordinates} from './_utils/fetch-coords';
import {fetchCurrentWeather} from './_utils/fetch-weather-data';

enum Units {
  Imperial = 'imperial',
  Metric = 'metric',
  Standard = 'standard',
}

type WeatherCondtion = {
  description: string;
  icon: string;
  id: number;
  main: string;
};

type ApiResponse = {
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
  weather: WeatherCondtion[];
};

export default async (req: NowRequest, res: NowResponse): Promise<void> => {
  try {
    let units = Units.Metric;
    let unitsInput: string;
    if (Array.isArray(req.query.units)) unitsInput = req.query.units[0];
    else unitsInput = req.query.units;
    const unitsList: string[] = [...Object.values(Units)];
    if (unitsList.includes(unitsInput)) units = unitsInput as Units;
    const params: {[key: string]: string} = {...req.query, units};
    if (!params.zip && !params.q && !params.lat && !params.lon) {
      const ip = req.headers['x-forwarded-for'];
      const coords = await fetchCoordinates(ip);
      [params.lat, params.lon] = coords;
    }
    const responseData = await fetchCurrentWeather(params);
    const {
      coord: {lat, lon}, dt,
      main: {feels_like, humidity, temp, temp_max, temp_min}, name,
      sys: {country, sunrise, sunset}, timezone, weather,
    } = responseData;
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