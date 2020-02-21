import fetch from 'node-fetch';

export type OWMParams = {[key: string]: string};

type WeatherCondtion = {
  description: string;
  icon: string;
  id: number;
  main: string;
};

type OWMCurrentWeatherData = {
  cod: number;
  coord: {
    lat: number;
    lon: number;
  };
  dt: number;
  main: {
    feels_like: number;
    humidity: number;
    temp: number;
    temp_max: number;
    temp_min: number;
  };
  name: string;
  sys: {
    country: string;
    sunrise: number;
    sunset: number;
  };
  timezone: number;
  weather: WeatherCondtion[];
};

export const fetchCurrentWeather =
  async (params: OWMParams = {}): Promise<OWMCurrentWeatherData> => {
    const url = new URL('https://api.openweathermap.org/data/2.5/weather');
    const searchParams = new URLSearchParams();
    searchParams.set('APPID', process.env.OPENWEATHER_API_KEY || '');
    for (const [param, value] of Object.entries(params)) {
      if (value !== '') searchParams.set(param, value);
    }
    url.search = searchParams.toString();
    const res = await fetch(url.toString());
    if (!res.ok) {
      throw Object.assign(new Error(), {
        message: 'Fetch response not OK',
        name: 'FetchError',
        response: res,
      });
    }
    const json: OWMCurrentWeatherData = await res.json();
    const statusCodeOk = 200;
    if (json.cod !== statusCodeOk) throw new Error('API response not OK');
    return json;
  };
