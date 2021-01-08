import fetch from 'node-fetch';

type Awaited<T> = T extends PromiseLike<infer U> ? U : T;
type Response = Awaited<ReturnType<typeof fetch>>;

type IpapiResponse = {
  asn: string;
  city: string;
  continent_code: string;
  country_area: number;
  country_calling_code: string;
  country_capital: string;
  country_code_iso3: string;
  country_code: string;
  country_name: string;
  country_population: number;
  country_tld: string;
  country: string;
  currency_name: string;
  currency: string;
  in_eu: boolean;
  ip: string;
  languages: string;
  latitude: number;
  longitude: number;
  org: string;
  postal: string;
  region_code: string;
  region: string;
  timezone: string;
  utc_offset: string;
  version: string;
};

// type IpstackResponse = {
//   city: string;
//   continent_code: string;
//   continent_name: string;
//   country_code: string;
//   country_name: string;
//   ip: string;
//   latitude: number;
//   location: {
//     calling_code: string;
//     capital: string;
//     country_flag_emoji_unicode: string;
//     country_flag_emoji: string;
//     country_flag: string;
//     geoname_id: number;
//     is_eu: boolean;
//     languages: {
//       code: string;
//       name: string;
//       native: string;
//     }[];
//   };
//   longitude: number;
//   region_code: string;
//   region_name: string;
//   type: string;
//   zip: string;
// };

type KeyCDNResponse = {
  data: {
    geo: {
      asn: number;
      city: string;
      continent_code: string;
      continent_name: string;
      country_code: string;
      country_name: string;
      datetime: string;
      host: string;
      ip: string;
      isp: string;
      latitude: number;
      longitude: number;
      metro_code: number;
      postal_code: string;
      rdns: string;
      region_code: string;
      region_name: string;
      timezone: string;
    };
  };
  description: string;
  status: string;
};

const createResponseError = (response: Response): Error & {
  response: Response;
} => Object.assign(new Error(), {
  message: 'Fetch response not OK',
  name: 'FetchError',
  response: response.clone(),
});

export const fetchCoordinates =
  async (ipAddress: string): Promise<[number, number]> => {
    let latitude: number | undefined,
      longitude: number | undefined;

    const errors: Error[] = [];

    try {
      /** https://ipapi.co/#api */
      const response = await fetch(`https://ipapi.co/${ipAddress}/json/`);
      if (!response.ok) throw createResponseError(response);
      const data = await response.json() as IpapiResponse;
      ({latitude, longitude} = data);
    }
    catch (ex) {
      errors.push(ex);
    }

    if (typeof latitude === 'number' && typeof longitude === 'number') {
      return [latitude, longitude];
    }

    let retriesRemaining = 3;

    while (
      !(typeof latitude === 'number' && typeof longitude === 'number')
      && retriesRemaining > 0
    ) {
      retriesRemaining -= 1;
      try {
        /** https://tools.keycdn.com/geo */
        const response = await fetch(`https://tools.keycdn.com/geo.json?host=${ipAddress}`);
        if (!response.ok) throw createResponseError(response);
        const {data} = await response.json() as KeyCDNResponse;
        ({latitude, longitude} = data.geo);
      }
      catch (ex) {
        errors.push(ex);
      }
    }

    if (typeof latitude === 'number' && typeof longitude === 'number') {
      return [latitude, longitude];
    }

    /*
     * I think we should carefully consider the implications of using an
     * insecure endpoint—all data will be exposed:
     *  - IP
     *  - API key
     *  - headers
     *  - etc
     */

    // try {
    //   /** https://ipstack.com/documentation */
    //   const response = await fetch(`http://api.ipstack.com/${ipAddress}?access_key=${process.env.IPSTACK_API_KEY}`);
    //   if (!response.ok) throw createResponseError(response);
    //   const data = await response.json() as IpstackResponse;
    //   ({latitude, longitude} = data);
    // }
    // catch (ex) {
    //   errors.push(ex);
    // }

    // if (typeof latitude === 'number' && typeof longitude === 'number') {
    //   return [latitude, longitude];
    // }

    /*
     * AggregateError seems to be currently unsupported by the version of Node
     * being used by Vercel's build system, so, instead:
     */
    // throw new AggregateError(errors, 'API response not OK');
    const aggregateError = Object.assign(new Error('API response not OK'), ({
      errors,
      name: 'AggregateError',
    }) as {
      errors: Error[];
      name: 'AggregateError';
    });

    throw aggregateError;
  };
