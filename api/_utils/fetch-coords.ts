import fetch from 'node-fetch';

type IPLocationData = {
  latitude: number | undefined;
  longitude: number | undefined;
};

export const fetchCoordinates =
  async (ipAddress: string): Promise<[number, number]> => {
    const response = await fetch(`https://ipapi.co/${ipAddress}/json/`);
    if (!response.ok) {
      throw Object.assign(new Error(), {
        message: 'Fetch response not OK',
        name: 'FetchError',
        response,
      });
    }
    const {latitude, longitude}: IPLocationData = await response.json();

    if (
      typeof latitude !== 'number'
      || typeof longitude !== 'number'
    ) throw new Error('API response not OK');

    return [latitude, longitude];
  };
