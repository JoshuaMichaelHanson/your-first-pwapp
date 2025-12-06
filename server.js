/* eslint-env node */
/*
 * @license
 * Your First PWA Codelab (https://g.co/codelabs/pwa)
 * Copyright 2019 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License
 */
'use strict';

const express = require('express');
const redirectToHTTPS = require('express-http-to-https').redirectToHTTPS;

// CODELAB: Change this to add a delay (ms) before the server responds.
const FORECAST_DELAY = 0;

// Open-Meteo API Base URL
const BASE_URL = 'https://api.open-meteo.com/v1/forecast';

// Fake forecast data used if we can't reach the API
const fakeForecast = {
  fakeData: true,
  latitude: 44.3,
  longitude: -92.4,
  timezone: 'America/Chicago',
  elevation: 406,
  current_units: {
    time: 'unixtime',
    interval: 'seconds',
    temperature_2m: '°F',
    is_day: '',
    weather_code: 'wmo code',
    wind_speed_10m: 'mp/h',
    snowfall: 'inch',
    snow_depth: 'ft',
    relative_humidity_2m: '%',
    wind_direction_10m: '°'
  },
  current: {
    time: 0,
    interval: 900,
    temperature_2m: -4.2,
    is_day: 0,
    weather_code: 1,
    wind_speed_10m: 6.9,
    snowfall: 0,
    snow_depth: 0.656,
    relative_humidity_2m: 77,
    wind_direction_10m: 339,
    summary: 'Clear',
    icon: 'clear-day',
    temperature: 43.4,
    humidity: 0.62,
    windSpeed: 3.74,
    windBearing: 208,
  },
  daily_units: {
    time: 'unixtime',
    weather_code: 'wmo code',
    temperature_2m_max: '°F',
    temperature_2m_min: '°F',
    snowfall_sum: 'inch',
    sunrise: 'unixtime',
    sunset: 'unixtime',
    precipitation_probability_max: '%'
  },
  daily: {
    data: [
      {
        time: 0,
        interval: 86400,
        weather_code: 3,
        temperature_2m_max: 12.7,
        temperature_2m_min: -6.6,
        snowfall_sum: 0,
        sunrise: 1764854830,
        sunset: 1764887602,
        temperatureHigh: 52.91,
        temperatureLow: 41.35,
      },
      {
        time: 86400,
        interval: 86400,
        weather_code: 51,
        temperature_2m_max: 30.3,
        temperature_2m_min: 13.7,
        snowfall_sum: 0.007,
        sunrise: 1764941292,
        sunset: 1764973991,
        temperatureHigh: 48.01,
        temperatureLow: 44.17,
      },
      {
        time: 172800,
        interval: 86400,
        weather_code: 71,
        temperature_2m_max: 19.9,
        temperature_2m_min: -0.6,
        snowfall_sum: 0,
        sunrise: 1765027752,
        sunset: 1765060382,
        temperatureHigh: 50.31,
        temperatureLow: 33.61,
      },
      {
        time: 259200,
        interval: 86400,
        weather_code: 73,
        temperature_2m_max: 10.1,
        temperature_2m_min: -11.8,
        snowfall_sum: 0.331,
        sunrise: 1765114210,
        sunset: 1765146776,
        temperatureHigh: 46.44,
        temperatureLow: 33.82,
      },
      {
        time: 345600,
        interval: 86400,
        weather_code: 3,
        temperature_2m_max: 60.5,
        temperature_2m_min: 43.82,
        snowfall_sum: 0,
        sunrise: 1765200666,
        sunset: 1765233172,
      },
      {
        time: 432000,
        interval: 86400,
        weather_code: 51,
        temperature_2m_max: 61.79,
        temperature_2m_min: 32.8,
        snowfall_sum: 0,
        sunrise: 1765287120,
        sunset: 1765319570,
      },
      {
        time: 518400,
        interval: 86400,
        weather_code: 51,
        temperature_2m_max: 61.79,
        temperature_2m_min: 32.8,
        snowfall_sum: 0,
        sunrise: 1765287120,
        sunset: 1765319570,
      },
      {
        time: 604800,
        interval: 86400,
        weather_code: 51,
        temperature_2m_max: 61.79,
        temperature_2m_min: 32.8,
        snowfall_sum: 0,
        sunrise: 1765287120,
        sunset: 1765319570,
      },
    ],
  },
};

/**
 * Maps Open-Meteo WMO weather codes to Dark Sky icon names.
 * @param {number} code WMO weather code
 * @param {boolean} isDay Whether it is day or night
 * @return {string} Dark Sky icon name
 */
function mapWeatherCodeToIcon(code, isDay = true) {
  // WMO Code mapping
  // 0: Clear sky
  if (code === 0) return isDay ? 'clear-day' : 'clear-night';
  // 1, 2, 3: Mainly clear, partly cloudy, and overcast
  if ([1, 2, 3].includes(code)) return isDay ? 'partly-cloudy-day' : 'partly-cloudy-night';
  // 45, 48: Fog
  if ([45, 48].includes(code)) return 'fog';
  // 51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82: Drizzle, Rain, Showers
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 'rain';
  // 71, 73, 75, 77, 85, 86: Snow
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'snow';
  // 95, 96, 99: Thunderstorm
  if ([95, 96, 99].includes(code)) return 'rain';

  return 'clear-day'; // Default
}

/**
 * Generates a fake forecast in case the weather API is not available.
 *
 * @param {String} location GPS location to use.
 * @return {Object} forecast object.
 */
function generateFakeForecast(location) {
  console.log('Generating fake forecast for location:', location);
  location = location || '40.7720232,-73.9732319';
  const commaAt = location.indexOf(',');

  // Create a new copy of the forecast
  const result = Object.assign({}, fakeForecast);
  result.latitude = parseFloat(location.substr(0, commaAt));
  result.longitude = parseFloat(location.substr(commaAt + 1));
  return result;
}


/**
 * Converts wind direction in degrees to cardinal direction.
 * @param {number} degrees Wind direction in degrees
 * @return {string} Cardinal direction (e.g., "N", "NE", "E")
 */
function degreesToCardinal(degrees) {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
}

/**
 * Gets the weather forecast from the Open-Meteo API for the given location.
 *
 * @param {Request} req request object from Express.
 * @param {Response} resp response object from Express.
 */
function getForecast(req, resp) {
  const location = req.params.location || '40.7720232,-73.9732319';
  const [lat, lon] = location.split(',');

  // &daily=weather_code,temperature_2m_max,temperature_2m_min,snowfall_sum,sunrise,sunset,precipitation_probability_max&models=best_match&current=temperature_2m,is_day,weather_code,wind_speed_10m,snowfall,relative_humidity_2m,wind_direction_10m&timezone=auto&wind_speed_unit=mph&temperature_unit=fahrenheit&precipitation_unit=inch
  // Open-Meteo URL - Requesting Fahrenheit, MPH, Inch, and 8 days
  // const url = `${BASE_URL}?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,wind_speed_10m,wind_direction_10m,wind_gusts_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum,rain_sum,showers_sum,snowfall_sum,precipitation_hours,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant&timezone=auto&timeformat=unixtime&forecast_days=8&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch`;

  const url = `${BASE_URL}?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,temperature_2m_min,snowfall_sum,sunrise,sunset,precipitation_probability_max&models=best_match&current=temperature_2m,is_day,weather_code,wind_speed_10m,snowfall,snow_depth,relative_humidity_2m,wind_direction_10m&timezone=auto&wind_speed_unit=mph&temperature_unit=fahrenheit&precipitation_unit=inch&timeformat=unixtime&forecast_days=8`;

  console.log('Fetching Open-Meteo Data:', url);
  fetch(url).then((resp) => {
    if (resp.status !== 200) {
      throw new Error(resp.statusText);
    }
    return resp.json();
  }).then((data) => {
    console.log('Open-Meteo Data:', data);

    const toSeconds = (t) => {
      if (typeof t === 'string') {
        return Math.floor(new Date(t).getTime() / 1000);
      }
      return t;
    };

    // Transform Open-Meteo data to Dark Sky format
    const darkSkyData = {
      latitude: data.latitude,
      longitude: data.longitude,
      timezone: data.timezone,
      elevation: data.elevation,
      currently: {
        time: toSeconds(data.current.time),
        summary: mapWeatherCodeToIcon(data.current.weather_code, !!data.current.is_day),
        icon: mapWeatherCodeToIcon(data.current.weather_code, !!data.current.is_day),
        temperature: data.current.temperature_2m,
        humidity: data.current.relative_humidity_2m / 100,
        snowFall: data.current.snowfall,
        snowDepth: data.current.snow_depth,
        relativeHumidity: data.current.relative_humidity_2m,
        windSpeed: data.current.wind_speed_10m,
        windBearing: degreesToCardinal(data.current.wind_direction_10m), // Converted to Cardinal
      },
      daily: {
        data: data.daily.time.map((time, index) => ({
          time: toSeconds(time),
          icon: mapWeatherCodeToIcon(data.daily.weather_code[index]),
          sunriseTime: toSeconds(data.daily.sunrise[index]),
          sunsetTime: toSeconds(data.daily.sunset[index]),
          temperatureHigh: data.daily.temperature_2m_max[index],
          temperatureLow: data.daily.temperature_2m_min[index],
          snowFall: data.daily.snowfall_sum[index],
          precipitationProbability: data.daily.precipitation_probability_max[index],
        }))
      }
    };
    console.log('Converted to Dark Sky Data:', darkSkyData);

    setTimeout(() => {
      console.log('Sending Dark Sky Data:', darkSkyData);
      darkSkyData.daily.data.map((day) => {
        console.log('Day:', day);
      });
      resp.json(darkSkyData);
    }, FORECAST_DELAY);
  }).catch((err) => {
    console.error('Open-Meteo API Error:', err.message);
    resp.json(generateFakeForecast(location));
  });
}

/**
 * Starts the Express server.
 *
 * @return {ExpressServer} instance of the Express server.
 */
function startServer() {
  const app = express();

  // Redirect HTTP to HTTPS,
  app.use(redirectToHTTPS([/localhost:(\d{4})/], [], 301));

  // Logging for each request
  app.use((req, resp, next) => {
    const now = new Date();
    const time = `${now.toLocaleDateString()} - ${now.toLocaleTimeString()}`;
    const path = `"${req.method} ${req.path}"`;
    const m = `${req.ip} - ${time} - ${path}`;
    // eslint-disable-next-line no-console
    console.log(m);
    next();
  });

  // Handle requests for the data
  app.get('/forecast/:location', getForecast);
  app.get('/forecast/', getForecast);
  app.get('/forecast', getForecast);

  // Handle requests for static files
  app.use(express.static('public'));

  // Start the server
  return app.listen('8000', () => {
    // eslint-disable-next-line no-console
    console.log('Local DevServer Started on port 8000...');
  });
}

startServer();
