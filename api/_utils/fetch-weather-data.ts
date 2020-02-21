import fetch from 'node-fetch';

type OWMParams = {[key: string]: string};

const fetchCurrentWeather = async (params = {}): Promise<> => {
  const url = new URL('https://api.openweathermap.org/data/2.5/weather');
  const searchParams = new URLSearchParams();
  searchParams.set('APPID', process.env.OPENWEATHER_API_KEY || '');
  for (const [param, value] of Object.entries(params)) {
    if (value) searchParams.set(param, value);
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
  const json = await res.json();
  const statusCodeOk = 200;
  if (json.cod !== statusCodeOk) throw new Error('API response not OK');
  return json;
};

module.exports = {fetchCurrentWeather};
