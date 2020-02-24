import fetch from 'node-fetch';

export type OWMParams = {[key: string]: string};

export enum OWMUnits {
  Imperial = 'imperial',
  Metric = 'metric',
  Standard = 'standard',
}

export type OWMWeatherCondition = {
  description: string;
  icon: string;
  id: number;
  main: string;
};

export type OWMCurrentWeatherData = {
  clouds: {
    all: number;
  };
  cod: number | string;
  coord: {
    lat: number;
    lon: number;
  };
  dt: number;
  main: {
    feels_like: number;
    humidity: number;
    pressure: number;
    temp: number;
    temp_max: number;
    temp_min: number;
  };
  name: string;
  rain?: {
    '1h': number;
    '3h': number;
  };
  snow?: {
    '1h': number;
    '3h': number;
  };
  sys: {
    country: string;
    sunrise: number;
    sunset: number;
  };
  timezone: number;
  visibility: number;
  weather: OWMWeatherCondition[];
  wind: {
    deg: number;
    speed: number;
  };
};

export type OWMForecastItem = {
  clouds: {
    all: number;
  };
  dt: number;
  dt_txt: string;
  main: {
    feels_like: number;
    grnd_level: number;
    humidity: number;
    pressure: number;
    sea_level: number;
    temp: number;
    temp_max: number;
    temp_min: number;
  };
  rain?: {
    '3h': number;
  };
  snow?: {
    '3h': number;
  };
  weather: OWMWeatherCondition[];
  wind: {
    deg: number;
    speed: number;
  };
};

export type OWMForecastWeatherData = {
  city: {
    coord: {
      lat: number;
      lon: number;
    };
    country: string;
    name: string;
    sunrise: number;
    sunset: number;
    timezone: number;
  };
  cnt: number;
  cod: number | string;
  list: OWMForecastItem[];
};

export class OpenWeather {
  apiKey: string;

  constructor (apiKey: string) {
    this.apiKey = apiKey;
  }

  fetchCurrent =
    async (params: OWMParams = {}): Promise<OWMCurrentWeatherData> => {
      const url = new URL('https://api.openweathermap.org/data/2.5/weather');
      const searchParams = new URLSearchParams();
      /* eslint-disable-next-line no-invalid-this */
      searchParams.set('appid', this.apiKey);

      for (const [param, value] of Object.entries(params)) {
        if (value !== '') searchParams.set(param, value);
      }

      url.search = searchParams.toString();
      const response = await fetch(url.toString());

      if (!response.ok) {
        throw Object.assign(new Error(), {
          message: 'Fetch response not OK',
          name: 'FetchError',
          response,
        });
      }

      const json: OWMCurrentWeatherData = await response.json();
      const statusCodeOk = 200;

      if (
        json.cod !== statusCodeOk
        && json.cod !== '200'
      ) throw new Error('API response not OK');

      return json;
    };

  fetchForecast =
    async (params: OWMParams = {}): Promise<OWMForecastWeatherData> => {
      const url = new URL('https://api.openweathermap.org/data/2.5/forecast');
      const searchParams = new URLSearchParams();
      /* eslint-disable-next-line no-invalid-this */
      searchParams.set('appid', this.apiKey);

      for (const [param, value] of Object.entries(params)) {
        if (value !== '') searchParams.set(param, value);
      }

      url.search = searchParams.toString();
      const response = await fetch(url.toString());

      if (!response.ok) {
        throw Object.assign(new Error(), {
          message: 'Fetch response not OK',
          name: 'FetchError',
          response,
        });
      }

      const json: OWMForecastWeatherData = await response.json();
      const statusCodeOk = 200;

      if (
        json.cod !== statusCodeOk
        && json.cod !== '200'
      ) throw new Error('API response not OK');

      return json;
    };
}
