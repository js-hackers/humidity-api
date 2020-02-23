import {getTimes, isDay, padTimeUnit} from '../api/_utils/helpers';
import {ApiResponseData} from '../api/current';

describe('getTimes', () => {
  test('has the correct shape', () => {
    const data = {
      dt: 1582028823,
      sunrise: 1582028823,
      sunset: 1582069131,
      timezone: -21600,
    };
    const times = getTimes(data as ApiResponseData);
    const {sunrise: x} = times;

    expect(times.dt).not.toBeUndefined();
    expect(times.sunrise).not.toBeUndefined();
    expect(times.sunset).not.toBeUndefined();
    expect(typeof x.formatted).toBe('string');
    expect(typeof x.h12.formatted).toBe('string');
    expect(x.h12.hms.length).toBe(3);
    expect(typeof x.h12.hms[0]).toBe('number');
    expect(typeof x.h12.hms[1]).toBe('number');
    expect(typeof x.h12.hms[2]).toBe('number');
    expect(typeof x.h12.pm).toBe('boolean');
    expect(x.hms.length).toBe(3);
    expect(typeof x.hms[0]).toBe('number');
    expect(typeof x.hms[1]).toBe('number');
    expect(typeof x.hms[2]).toBe('number');
  });

  test('returns the correct time data', () => {
    const data = {
      dt: 1582028823,
      sunrise: 1582028823,
      sunset: 1582069131,
      timezone: -21600,
    };
    const {sunrise, sunset} = getTimes(data as ApiResponseData);

    expect(sunrise.hms).toEqual([6, 27, 3]);
    expect(sunrise.h12.hms).toEqual([6, 27, 3]);
    expect(sunrise.h12.pm).toBe(false);
    expect(sunset.hms).toEqual([17, 38, 51]);
    expect(sunset.h12.hms).toEqual([5, 38, 51]);
    expect(sunset.h12.pm).toBe(true);
  });

  test('formats correctly', () => {
    const data = {
      dt: 1582028823,
      sunrise: 1582028823,
      sunset: 1582069131,
      timezone: -21600,
    };
    const {sunrise, sunset} = getTimes(data as ApiResponseData);

    expect(sunrise.formatted).toBe('06:27');
    expect(sunrise.h12.formatted).toBe('6:27');
    expect(sunset.formatted).toBe('17:38');
    expect(sunset.h12.formatted).toBe('5:38');
  });
});

describe('isDay', () => {
  test('not before sunrise', () => {
    expect(isDay({
      dt: 1582028822,
      sunrise: 1582028823,
      sunset: 1582069131,
    } as ApiResponseData)).toBe(false);
  });

  test('at sunrise', () => {
    expect(isDay({
      dt: 1582028823,
      sunrise: 1582028823,
      sunset: 1582069131,
    } as ApiResponseData)).toBe(true);
  });

  test('between', () => {
    expect(isDay({
      dt: 1582069130,
      sunrise: 1582028823,
      sunset: 1582069131,
    } as ApiResponseData)).toBe(true);
  });

  test('not at sunset', () => {
    expect(isDay({
      dt: 1582069131,
      sunrise: 1582028823,
      sunset: 1582069131,
    } as ApiResponseData)).toBe(false);
  });

  test('not after sunset', () => {
    expect(isDay({
      dt: 1582069132,
      sunrise: 1582028823,
      sunset: 1582069131,
    } as ApiResponseData)).toBe(false);
  });
});

describe('padTimeUnit', () => {
  test('works with no argument', () => {
    /* eslint-disable-next-line @typescript-eslint/ban-ts-ignore */
    // @ts-ignore
    expect(padTimeUnit()).toBe('00');
  });

  test('works with a string', () => {
    expect(padTimeUnit('2' as unknown as number)).toBe('00');
  });

  test('works with 1 digit', () => {
    expect(padTimeUnit(2)).toBe('02');
  });

  test('works with 2 digits', () => {
    expect(padTimeUnit(22)).toBe('22');
  });

  test('works with 3 digits', () => {
    expect(padTimeUnit(222)).toBe('222');
  });
});
