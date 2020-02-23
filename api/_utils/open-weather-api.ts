import fetch from 'node-fetch';

export enum Units {
  Imperial = 'imperial',
  Metric = 'metric',
  Standard = 'standard',
}

export type OWMParams = {[key: string]: string};

export type WeatherCondition = {
  description: string;
  icon: string;
  id: number;
  main: string;
};

export type OWMCurrentWeatherData = {
  clouds: {
    all: number;
  };
  cod: number;
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
  weather: WeatherCondition[];
  wind: {
    deg: number;
    speed: number;
  };
};

export class OpenWeather {
  apiKey: string;

  constructor (apiKey: string) {
    this.apiKey = apiKey;
  }

  async fetchCurrent (params: OWMParams = {}): Promise<OWMCurrentWeatherData> {
    const url = new URL('https://api.openweathermap.org/data/2.5/weather');
    const searchParams = new URLSearchParams();
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

    if (json.cod !== statusCodeOk) throw new Error('API response not OK');

    return json;
  }
}
