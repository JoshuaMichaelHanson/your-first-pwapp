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

// new helpers functions *************************************
const weatherSummaries = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  56: "Freezing light drizzle",
  57: "Freezing dense drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  66: "Freezing rain (light)",
  67: "Freezing rain (heavy)",
  71: "Slight snow",
  73: "Moderate snow",
  75: "Heavy snow",
  77: "Snow geoins",
  80: "Rain showers (slight)",
  81: "Rain showers (moderate)",
  82: "Rain showers (violent)",
  85: "Snow showers (slight)",
  86: "Snow showers (heavy)",
  95: "Thunderstorm",
  96: "Thunderstorm with slight hail",
  99: "Thunderstorm with heavy hail",
};

const weatherIcons = {
  "clear-day": "☀️",
  "clear-night": "🌙",
  "partly-cloudy-day": "⛅",
  "partly-cloudy-night": "☁️",
  fog: "🌫️",
  rain: "🌧️",
  snow: "❄️",
};

const iconFallback = "🌤️";

const windIcons = {
  "calm": "🌬️",
  "light": "",
  "moderate": "",
  "strong": "",
}

const avalancheIcons = {
  "low": "",
  "moderate": "",
  "high": "",
}

const ridingConditionsIcons = {
  "ice": "",
  "groomers": "",
  "powder": "",
  "epic powder": "",
}

function degreesToCardinal(degrees) {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
}

function mapWeatherCodeToIcon(code, isDay = true) {
  if (code === 0) return isDay ? "clear-day" : "clear-night";
  if ([1, 2, 3].includes(code)) return isDay ? "partly-cloudy-day" : "partly-cloudy-night";
  if ([45, 48].includes(code)) return "fog";
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "rain";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "snow";
  if ([95, 96, 99].includes(code)) return "rain";
  return "clear-day";
}

function calculateWindChill(tempF, windMph) {
  if (tempF > 50 || windMph < 3) return tempF;
  return Math.round(35.74 + (0.6215 * tempF) - (35.75 * Math.pow(windMph, 0.16)) + (0.4275 * tempF * Math.pow(windMph, 0.16)));
}

function calculateAvalancheRisk(snowfall24h, recentSnowfall, windSpeed) {
  console.log('Calculating avalanche risk:', snowfall24h, recentSnowfall, windSpeed);
  const totalSnow3Days = recentSnowfall.slice(0, 3).reduce((sum, amount) => sum + amount, 0);
  console.log('Total snowfall in the last 3 days:', totalSnow3Days);

  if (snowfall24h > 6 || totalSnow3Days > 12 || windSpeed > 25) {
    return "high";
  } else if (snowfall24h > 3 || totalSnow3Days > 6 || windSpeed > 15) {
    return "moderate";
  }
  return "low";
}

function formatTime(timestamp, timezone) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: timezone,
  }).format(new Date(timestamp * 1000));
}

function formatDateLabel(timestamp, timezone) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: timezone,
  }).format(new Date(timestamp * 1000));
}

function formatUpdatedLabel(timestamp, timezone) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
    timeZone: timezone,
  }).format(new Date(timestamp * 1000));
}

function getWeatherEmoji(iconName) {
  return weatherIcons[iconName] ?? iconFallback;
}

function getWeatherSummary(code) {
  return weatherSummaries[code] ?? "Unknown";
}

function buildDailyForecast(daily, timezone) {
  return daily.map((day, index) => {
    const iconKey = mapWeatherCodeToIcon(day.weather_code, true);
    return {
      label: formatDateLabel(day.time, timezone),
      high: Math.round(day.temperature_2m_max),
      low: Math.round(day.temperature_2m_min),
      icon: getWeatherEmoji(iconKey),
      snowfall: day.snowfall_sum ? day.snowfall_sum.toFixed(3) : "0",
      precipProb: day.precipitation_probability_max || 0,
    };
  });
}

function elevationToFeet(elevation) {
  return Math.round(elevation * 3.28084);
}

// end new **************************************************

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

// https://api.open-meteo.com/v1/forecast?latitude=40.03853&longitude=-92.4259&daily=snowfall_sum&timezone=auto&past_days=14&forecast_days=1&timeformat=unixtime&wind_speed_unit=mph&temperature_unit=fahrenheit&precipitation_unit=inch
async function getPast10DaysOfSnowfall(location) {
  console.log('Getting past 10 days of snowfall for location:', location);
  const [lat, lon] = location.split(',');
  const url = `${BASE_URL}?latitude=${lat}&longitude=${lon}&daily=snowfall_sum&timezone=auto&past_days=14&forecast_days=1&timeformat=unixtime&wind_speed_unit=mph&temperature_unit=fahrenheit&precipitation_unit=inch`;
  const response = await fetch(url);
  const data = await response.json();
  console.log('Past 10 days of snowfall:', data);
  const snowfallSum = data.daily.snowfall_sum.reduce((total, value) => total + (value || 0), 0);
  console.log('Snowfall sum:', snowfallSum);
  return snowfallSum.toFixed(3);
}

/**
 * Gets the weather forecast from the Open-Meteo API for the given location.
 *
 * @param {Request} req request object from Express.
 * @param {Response} resp response object from Express.
 */
async function getForecast(req, resp) {
  console.log('Getting forecast for location:', req.params.location);
  const location = req.params.location || '44.038463,-92.425963';
  const [lat, lon] = location.split(',');

  // https://api.open-meteo.com/v1/forecast?latitude=40.03853&longitude=-92.4259&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,snowfall_sum,precipitation_sum,precipitation_probability_max&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,snowfall,weather_code,wind_speed_10m,wind_direction_10m&timezone=auto&past_days=2&forecast_days=3&timeformat=unixtime&wind_speed_unit=mph&temperature_unit=fahrenheit&precipitation_unit=inch
  // &daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,snowfall_sum,precipitation_sum,precipitation_probability_max&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,snowfall,weather_code,wind_speed_10m,wind_direction_10m&timezone=auto&past_days=2&forecast_days=5&timeformat=unixtime&wind_speed_unit=mph&temperature_unit=fahrenheit&precipitation_unit=inch

  const url = `${BASE_URL}?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,snowfall_sum,precipitation_sum,precipitation_probability_max&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,precipitation_probability,snowfall,snowfall_height,weather_code,wind_speed_10m,wind_direction_10m&timezone=auto&past_days=2&forecast_days=5&timeformat=unixtime&wind_speed_unit=mph&temperature_unit=fahrenheit&precipitation_unit=inch`;

  console.log('Fetching Open-Meteo Data:', url);
  fetch(url).then((resp) => {
    if (resp.status !== 200) {
      throw new Error(resp.statusText);
    }
    return resp.json();
  }).then(async (data) => {

    // the total is only for the day but I want last 10 days snow depth
    const snowfallSum = await getPast10DaysOfSnowfall(location);
    console.log('Snowfall Sum:', snowfallSum);

    console.log('Open-Meteo Data:', data);

    const current = data.current ?? {};
    current.snow_depth = snowfallSum;
    const daily = data.daily;
    const isDay = current.is_day === 1;
    const iconKey = mapWeatherCodeToIcon(current.weather_code ?? 0, isDay);
    const windDirLabel = degreesToCardinal(current.wind_direction_10m ?? 0);
    const windChill = calculateWindChill(current.temperature_2m ?? 0, current.wind_speed_10m ?? 0);

    console.log('Current:', current);
    console.log('Daily:', daily);
    const recentSnowfall = daily.snowfall_sum.slice(0, 3).map(sum => sum || 0);
    const avalancheRisk = calculateAvalancheRisk(
      daily[2]?.snowfall_sum || 0,
      recentSnowfall,
      current.wind_speed_10m || 0
    );
    // Transform to front-end format
    const darkSkyData = {
      latitude: data.latitude,
      longitude: data.longitude,
      timezone: data.timezone,
      timezoneAbbreviation: data.timezone_abbreviation,
      elevation: elevationToFeet(data.elevation),
      currently: {
        time: current.time * 1000, // switch to js time ms
        summary: getWeatherSummary(current.weather_code),
        icon: getWeatherEmoji(iconKey),
        temperature: Math.round(current.temperature_2m),
        feelsLike: Math.round(current.apparent_temperature),
        humidity: current.relative_humidity_2m,
        precipitation: current.precipitation,
        precipitationProbability: current.precipitation_probability,
        snowFall: current.snowfall,
        snowDepth: current.snow_depth,  // my 10 day calculation
        windSpeed: current.wind_speed_10m,
        windBearing: windDirLabel,
        windChill: windChill,
        avalancheRisk: avalancheRisk,
        sunrise: data.daily?.sunrise?.[2] * 1000, // we went 2 days back to get recent snow-fall
        sunset: data.daily?.sunset?.[2] * 1000,
      },
      daily: {
        data: daily.time.map((time, index) => ({
          time: time * 1000,
          timeLabel: formatDateLabel(time, data.timezone),
          icon: getWeatherEmoji(mapWeatherCodeToIcon(daily.weather_code[index])),
          sunriseTime: daily.sunrise[index] * 1000,
          sunsetTime: daily.sunset[index] * 1000,
          temperatureHigh: Math.round(daily.temperature_2m_max[index]),
          temperatureLow: Math.round(daily.temperature_2m_min[index]),
          snowFall: daily.snowfall_sum ? daily.snowfall_sum[index].toFixed(3) : "0",
          precipitationProbability: daily.precipitation_probability_max[index] || 0,
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
    console.log(err);
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
