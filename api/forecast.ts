import {NowRequest, NowResponse} from '@now/node';
import {
  OpenWeather,
  OWMParams,
  OWMUnits,
  OWMWeatherCondition,
} from './_utils/open-weather-api';
import {fetchCoordinates} from './_utils/location-api';

export type ForecastItem = {
  clouds_all: number;
  dt: number;
  humidity: number;
  pressure: number;
  pressure_grnd_level: number;
  pressure_sea_level: number;
  rain_3h: number;
  snow_3h: number;
  temp: number;
  temp_feels_like: number;
  temp_max: number;
  temp_min: number;
  weather: OWMWeatherCondition[];
  wind_deg: number;
  wind_speed: number;
};

export type ForecastWeatherData = {
  country: string;
  lat: number;
  list: ForecastItem[];
  lon: number;
  name: string;
  sunrise: number;
  sunset: number;
  timezone: number;
  units: OWMUnits;
};

export default async (req: NowRequest, res: NowResponse): Promise<void> => {
  try {
    let unitsInput: string;

    if (Array.isArray(req.query.units)) unitsInput = req.query.units[0];
    else unitsInput = req.query.units;

    let units = OWMUnits.Metric;
    const unitsList: string[] = [...Object.values(OWMUnits)];

    if (unitsList.includes(unitsInput)) units = unitsInput as OWMUnits;

    const params: OWMParams = {...req.query, units};

    if (!params.zip && !params.q && !params.lat && !params.lon) {
      const ipAddress = req.headers['x-forwarded-for'];
      if (typeof ipAddress !== 'string') {
        throw new Error('No location data available');
      }
      const [lat, lon] = await fetchCoordinates(ipAddress);
      [params.lat, params.lon] = [String(lat), String(lon)];
    }

    const {fetchForecast} = new OpenWeather(process.env.OPENWEATHER_API_KEY || '');
    const responseData = await fetchForecast(params);

    const data: ForecastWeatherData = {
      country: responseData.city.country,
      lat: responseData.city.coord.lat,
      list: responseData.list.map(item => ({
        clouds_all: item.clouds.all,
        dt: item.dt,
        humidity: item.main.humidity,
        pressure: item.main.pressure,
        pressure_grnd_level: item.main.grnd_level,
        pressure_sea_level: item.main.sea_level,
        rain_3h: (item.rain && item.rain['3h']) || 0,
        snow_3h: (item.snow && item.snow['3h']) || 0,
        temp: item.main.temp,
        temp_feels_like: item.main.feels_like,
        temp_max: item.main.temp_max,
        temp_min: item.main.temp_min,
        weather: item.weather,
        wind_deg: item.wind.deg,
        wind_speed: item.wind.speed,
      })),
      lon: responseData.city.coord.lon,
      name: responseData.city.name,
      sunrise: responseData.city.sunrise,
      sunset: responseData.city.sunset,
      timezone: responseData.city.timezone,
      units,
    };

    res.json(data);
  }
  catch (ex: unknown) {
    console.error(ex);
    const statusCode = 500;
    res.status(statusCode).end();
  }
};
