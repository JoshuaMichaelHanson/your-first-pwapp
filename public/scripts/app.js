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
"use strict";
console.log('app.js loaded');
const weatherApp = {
    selectedLocations: {},
    addDialogContainer: document.getElementById("addDialogContainer")
};

function createIconImg(src, altText) {
    if (!src) {
        return null;
    }
    const img = document.createElement("img");
    img.classList.add("icon-svg");
    img.src = src;
    img.alt = altText || "";
    img.decoding = "async";
    img.loading = "lazy";
    return img;
}

/**
 * Toggles the visibility of the add location dialog box.
 */
function toggleAddDialog() {
    weatherApp.addDialogContainer.classList.toggle("visible");
}

function showAddResortDialog() {
    document.getElementById("locationNameInputDiv").style.display = "none";
    document.getElementById("resortSelectDiv").style.display = "block";
    document.getElementById("selectCityToAdd").value = "";
    document.querySelector(".dialog-title").textContent = "Add New Resort";
    toggleAddDialog();
}

function showAddCurrentLocationDialog() {
    document.getElementById("locationNameInputDiv").style.display = "block";
    document.getElementById("resortSelectDiv").style.display = "none";
    document.getElementById("newLocationName").value = "";
    document.querySelector(".dialog-title").textContent = "Add Current Location";
    toggleAddDialog();
}

/**
 * Event handler for butDialogAdd, adds the selected location to the list.
 */
function addLocation() {
    // Hide the dialog
    toggleAddDialog();

    const isCurrentLocation = document.getElementById("locationNameInputDiv").style.display === "block";

    if (isCurrentLocation) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(getCoordsInfo, geoError);
        } else {
            console.log("Geo-location not supported");
            alert("Geo-location not supported by your browser");
        }
    } else {
        // Get the selected city
        const select = document.getElementById("selectCityToAdd");
        const selected = select.options[select.selectedIndex];
        if (!selected || !selected.value) {
            return;
        }
        const geo = selected.value;
        const label = selected.textContent;

        const location = { label: label, geo: geo };
        console.log('Adding location from list:', location);
        createCardAndUpdateSavedList(location);
    }
}

function createCardAndUpdateSavedList(location) {
    // Create a new card & get the weather data from the server
    const card = getForecastCard(location);
    getForecastFromNetwork(location.geo).then(forecast => {
        renderForecast(card, forecast);
    });
    // Save the updated list of selected cities.
    weatherApp.selectedLocations[location.geo] = location;
    saveLocationList(weatherApp.selectedLocations);
}

function getCoordsInfo(position) {
    console.log('getCoordsInfo');
    const geo = position.coords.latitude + ',' + position.coords.longitude;
    let label = document.getElementById("newLocationName").value;
    if (!label) {
        label = "Current Location";
    }
    const location = { label: label, geo: geo };
    createCardAndUpdateSavedList(location);
}

/**
 * Event handler for .remove-city, removes a location from the list.
 *
 * @param {Event} evt
 */
function removeLocation(evt) {
    const card = evt.target.closest(".city-card");
    if (card) {
        const id = card.id;
        card.remove();
        if (weatherApp.selectedLocations[id]) {
            delete weatherApp.selectedLocations[id];
            saveLocationList(weatherApp.selectedLocations);
        }
    }
}

function openNws(evt) {
    console.log('openNws', evt);
    const card = evt.target.closest(".city-card");
    console.log("Hi its me id=", card.id);
    // window.open("https://www.w3schools.com");
    // need to split the lat and longitude
    let coords = card.id.split(",");
    console.log("Coords ", coords);
    // https://forecast.weather.gov/MapClick.php?lat=44.0136&lon=-92.4757&unit=0&lg=english&FcstType=graphical
    const openUrl =
        "https://forecast.weather.gov/MapClick.php?lat=" +
        coords[0] +
        "&lon=" +
        coords[1] +
        "&unit=0&lg=english&FcstType=graphical";
    console.log('Open from name ', openUrl);
    window.open(openUrl);
}

function openCurrentLoc(position) {
    console.log("Position", position);
    const openUrl =
        "https://forecast.weather.gov/MapClick.php?lat=" +
        position.coords.latitude +
        "&lon=" +
        position.coords.longitude +
        "&unit=0&lg=english&FcstType=graphical";
    console.log("Open from current location", openUrl);
    window.open(openUrl);
}

function openNwsWithCurrentLocation() {
    console.log("Open with safari?");
    if (navigator.geolocation) {
        console.log("Navigator enabled!");
        navigator.geolocation.getCurrentPosition(openCurrentLoc, geoError);
    } else {
        console.log("Geo-location not supported");
    }
}

function geoError(err) {
    console.log("Error with getCurrentPosition", err);
}

/**
 * Renders the forecast data into the card element.
 *
 * @param {Element} card The card element to update.
 * @param {Object} data Weather forecast data to update the element with.
 */
function renderForecast(card, data) {
    if (!data) {
        // There's no data, skip the update.
        return;
    }

    console.log('Card', card);
    console.log('Data', document.getElementById('44.038463,-92.425963'));
    console.log("Forecast Data", data);

    // calculate the daylight hours
    const sunRise = data.currently?.sunrise;
    const sunRiseLabel = formatTime(sunRise, data.timezone);
    const sunSet = data.currently?.sunset;
    const sunSetLabel = formatTime(sunSet, data.timezone);
    const dayLightHours = (sunSet - sunRise) / 3600;
    console.log("Daylight Hours", dayLightHours);

    // Elevation
    if (data.elevation) {
        card.querySelector(".elevation").textContent = `${Math.round(data.elevation)}f elevation`;
    }

    card.querySelector(".city-timezone-label").textContent = data.timezone;
    card.querySelector(".temp-current").textContent = data.currently.temperature;
    const summaryIcon = card.querySelector(".summary-icon");
    summaryIcon.innerHTML = "";
    const summaryImg = createIconImg(data.currently.icon, data.currently.summary);
    if (summaryImg) {
        summaryIcon.appendChild(summaryImg);
    }
    card.querySelector(".summary").textContent = data.currently.summary;
    card.querySelector(".wind-speed").textContent = data.currently.windSpeed;
    card.querySelector(".wind-bearing").textContent = data.currently.windBearing;
    card.querySelector(".wind-chill").textContent = data.currently.windChill;
    card.querySelector(".feels-like").textContent = data.currently.feelsLike;
    const avalancheRisk = card.querySelector(".avalanche-risk");
    avalancheRisk.textContent = "";
    const avalancheImg = createIconImg(
        data.currently.avalancheIcon,
        `Avalanche risk ${data.currently.avalancheRisk}`
    );
    if (avalancheImg) {
        avalancheRisk.appendChild(avalancheImg);
    }
    avalancheRisk.appendChild(
        document.createTextNode(`Avalanche Risk: ${data.currently.avalancheRisk.toUpperCase()}`)
    );
    avalancheRisk.classList.add(getAvalancheRiskClass(data.currently.avalancheRisk));

    card.querySelector(".current-time").textContent = formatUpdateTime(data.currently.time);
    card.querySelector(".snow-depth").textContent = data.currently.snowDepth + '"';
    card.querySelector(".precipitation-probablity").textContent = data.currently.precipitationProbability + '%';
    card.querySelector(".humidity").textContent = data.currently.humidity + '%';

    card.querySelector(".daylight").textContent = sunRiseLabel + ' - ' + sunSetLabel;
    card.querySelector(".snow-fall").textContent = data.currently.snowFall + '"';
    card.querySelector(".precipitation-amount").textContent = data.currently.precipitation + '"';

    // Render forecast days
    const forecastContainer = card.querySelector(".forecast-info");
    forecastContainer.innerHTML = ""; // Clear existing
    if (data.daily && data.daily.data) {
        // skip the first 3 days, they are past and today's forecast
        const futureDays = data.daily.data.slice(3);
        futureDays.forEach((day) => {
            const dayElement = document.createElement("div");
            dayElement.classList.add("forecast-day");
            dayElement.innerHTML = `
                <div class="forecast-date">${day.timeLabel}</div>
                <div class="forecast-high-low">${day.temperatureHigh}° / ${day.temperatureLow}°</div>
                <div class="forecast-snow">
                    <span class="forecast-snow-icon"></span>
                    <span class="forecast-snow-value">${day.snowFall}"</span>
                </div>
                <div class="forecast-precip">${day.precipitationProbability}%</div>
                <div class="forecast-icon"></div>
            `;
            const forecastIcon = dayElement.querySelector(".forecast-icon");
            const forecastImg = createIconImg(day.icon, `${day.timeLabel} forecast`);
            if (forecastImg) {
                forecastIcon.appendChild(forecastImg);
            }
            const snowIcon = dayElement.querySelector(".forecast-snow-icon");
            const snowImg = createIconImg("/images/meteocons/fill/svg/snowflake.svg", "Snowfall");
            if (snowImg) {
                snowIcon.appendChild(snowImg);
            }
            forecastContainer.appendChild(dayElement);
        });
    }

    // If the loading spinner is still visible, remove it.
    const spinner = card.querySelector(".card-spinner");
    if (spinner) {
        card.removeChild(spinner);
    }
}

function formatUpdateTime(msTime) {
    const date = new Date(msTime);

    // Month abbreviations
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const month = months[date.getMonth()];
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${month} ${day}, ${hours}:${minutes}`;
}
/**
 * Formats a timestamp into a human-readable time string.
 *
 * @param {number} timestamp - The timestamp to format - converted to ms on server
 * @param {string} timezone - The timezone to use for formatting.
 * @returns {string} The formatted time string.
 */
function formatTime(timestamp, timezone) {
    return new Intl.DateTimeFormat("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: timezone,
    }).format(new Date(timestamp));
}

function getAvalancheRiskClass(risk) {
    switch (risk) {
        case 'low':
            return 'avalanche-risk-low';
        case 'moderate':
            return 'avalanche-risk-moderate';
        case 'high':
            return 'avalanche-risk-high';
        case 'very high':
            return 'avalanche-risk-very-high';
        default:
            return 'avalanche-risk-unknown';
    }
}

/**
 * Get's the latest forecast data from the network.
 *
 * @param {string} coords Location object to.
 * @return {Object} The weather forecast, if the request fails, return null.
 */
function getForecastFromNetwork(coords) {
    return fetch(`/forecast/${coords}`)
        .then(response => {
            return response.json();
        })
        .catch(() => {
            return null;
        });
}

/**
 * Get's the cached forecast data from the caches object.
 *
 * @param {string} coords Location object to.
 * @return {Object} The weather forecast, if the request fails, return null.
 */
function getForecastFromCache(coords) {
    // CODELAB: Add code to get weather forecast from the caches object.
    if (!('caches' in window)) {
        return null;
    }
    const url = `${window.location.origin}/forecast/${coords}`;
    return caches.match(url)
        .then((response) => {
            if (response) {
                return response.json();
            }
            return null;
        })
        .catch((err) => {
            console.error('Error getting data from cache', err);
            return null;
        });
}

/**
 * Get's the HTML element for the weather forecast, or clones the template
 * and adds it to the DOM if we're adding a new item.
 *
 * @param {Object} location Location object
 * @return {Element} The element for the weather forecast.
 */
function getForecastCard(location) {
    console.log('getForecastCard', location);
    const id = location.geo;
    const card = document.getElementById(id);
    if (card) {
        return card;
    }
    const newCard = document.getElementById("city-card-template").content.cloneNode(true);
    // debugger;
    newCard.querySelector(".city-label").textContent = location.label;
    newCard.querySelector(".city-card").setAttribute("id", id);
    newCard
        .querySelector(".remove-city")
        .addEventListener("click", removeLocation);
    // add listener to open weather.gov
    newCard.querySelector(".city-label").addEventListener("click", openNws);
    document.querySelector(".city-container").appendChild(newCard);
    console.log('What is this new card?', newCard);
    let theNewCard = document.getElementById(id);
    return theNewCard;
}

/**
 * Gets the latest weather forecast data and updates each card with the
 * new data.
 */
function updateData() {
    console.log('updateData');
    Object.keys(weatherApp.selectedLocations).forEach(key => {
        const location = weatherApp.selectedLocations[key];
        const card = getForecastCard(location);
        // CODELAB: Add code to call getForecastFromCache
        getForecastFromCache(location.geo)
            .then((forecast) => {
                renderForecast(card, forecast);
            });
        // Get the forecast data from the network.
        getForecastFromNetwork(location.geo).then(forecast => {
            renderForecast(card, forecast);
        });
    });
}

/**
 * Saves the list of locations.
 *
 * @param {Object} locations The list of locations to save.
 */
function saveLocationList(locations) {
    const data = JSON.stringify(locations);
    localStorage.setItem("locationList", data);
}

/**
 * Loads the list of saved location.
 *
 * @return {Array}
 */
function loadLocationList() {
    let locations = localStorage.getItem("locationList");
    if (locations) {
        try {
            locations = JSON.parse(locations);
        } catch (ex) {
            locations = {};
        }
    }
    if (!locations || Object.keys(locations).length === 0) {
        const key = "44.038463,-92.425963";
        locations = {};
        locations[key] = { label: "Hanson House", geo: "44.038463,-92.425963" };
    }
    return locations;
}

/**
 * 44.03818972735139, -92.42589161426046
 * Initialize the app, gets the list of locations from local storage, then
 * renders the initial data.
 */
function init() {
    console.log('init');
    // Get the location list, and update the UI.
    weatherApp.selectedLocations = loadLocationList();
    updateData();

    // Add event listeners
    document.getElementById("butAdd").addEventListener("click", showAddResortDialog);
    document.getElementById("butAddCurrent").addEventListener("click", showAddCurrentLocationDialog);
    document.getElementById("butDialogCancel").addEventListener("click", toggleAddDialog);
    document.getElementById("butDialogAdd").addEventListener("click", addLocation);
}

init();
