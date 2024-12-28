////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// site_params.js
// This file contains the scripts for the site paramters for the frontend.
//
// Please refer to the LICENSE and DISCLAIMER files for more information regarding the use and distribution of this code
// By using this code, you agree to abide by the terms and conditions in those files.
//
// Author: Siddharth Gowda [https://github.com/siddharth]
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// GLOBALS & CONSTANTS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// the map used for location of climatic and seismic data
const CLIMATE_SESMIC_TABLE_HEADER = [
  "Wind Velocity Pressure, kPa, 1/50 (q)",
  "Ground Snow Load, kPa, 1/50 (Ss)",
  "Rain Load, kPa, 1/50 (Sr)",
  "Design Spectral Acceleration at 0.2 sec",
  "Design Spectral Acceleration at 1 sec",
  "Latitude",
  "Longitude",
];

let isLocationDataSet = false;

let MAP;

// THESE CONSTANTS ARE AUTO IMPORTED FROM alert_box.js
// const ERROR = "ERROR";
// const SUCCESS = "SUCCESS";
// const NOTIFICATION = "NOTIFICATION";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ON PAGE LOAD (First Function Ran)
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

window.onload = function () {
  const resultsTable = document.getElementById("climate-sesmic-table");
  // rendering empty Climate and Sesmic Table, ONLY Headers
  resultsTable.render(CLIMATE_SESMIC_TABLE_HEADER, [[]]);
  // Setting Map Pin to Myhal University of Toronto
  setMap(43.66074, -79.39661, "Myhal Centre, Toronto, Ontario, Canada");
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// MAP // TODO: Make Map it's own component
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Update the map with the given latitude, longitude, and address
 * @param latitude
 * @param longitude
 * @param address
 */
function setMap(latitude, longitude, address) {
  // If the map already exists, remove it
  if (MAP) {
    MAP.remove();
  }

  // Create a new map
  MAP = L.map("map", {
    attributionControl: false,
  }).setView([latitude, longitude], 13);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
  }).addTo(MAP);

  // Add a marker with a popup
  L.marker([latitude, longitude]).addTo(MAP).bindPopup(address);
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Events and Defined Event Functions
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// This event is used to get and save the climate and sesmic data for the cite
// this semsic and climate data is from the goverment of canada api
// https://www.earthquakescanada.nrcan.gc.ca/api/canshm/graphql
document
  .getElementById("location_button")
  .addEventListener("click", async () => {
    const siteDesignationInput = document.getElementById(
      "site-designation-input"
    );
    const chosenDesignation = siteDesignationInput.data();
    console.log(chosenDesignation);
    const address = document.getElementById("address");
    if (!address.value || !chosenDesignation) {
      const alertBox = document.getElementById("alert-box");
      alertBox.alert(
        "Please enter the address and all site designation details. If using Vs30, ensure the value is between 140 and 3000."
      );
      return;
    }
    const { siteDesignation, seismicValue } = chosenDesignation;

    const result = await locationCall(
      address.value,
      siteDesignation,
      seismicValue
    );

    // update table with sesmic and climate data values
    // Comment Should be kept for reference
    // HEADERS = [
    //     "Wind Velocity Pressure, kPa, 1/50 (q)",
    //     "Ground Snow Load, kPa, 1/50 (Ss)",
    //     "Rain Load, kPa, 1/50 (Sr)",
    //     "Design Spectral Acceleration at 0.2 sec",
    //     "Design Spectral Acceleration at 1 sec",
    //     "Latitude",
    //     "Longitude",
    //   ];
    if (result?.detail) {
      const alertBox = document.getElementById("alert-box");
      alertBox.alert("Address Not Found. Maybe use a postal code");
      return;
    }
    data = [
      [
        result.wind_velocity_pressure,
        result.snow_load,
        result.rain_load,
        result.design_spectral_acceleration_0_2,
        result.design_spectral_acceleration_1,
        Number(result.latitude).toFixed(3),
        Number(result.longitude).toFixed(3),
      ],
    ];
    const resultsTable = document.getElementById("climate-sesmic-table");
    resultsTable.render(CLIMATE_SESMIC_TABLE_HEADER, data);
    setMap(result.latitude, result.longitude, result.address);
    isLocationDataSet = true;
  });

document.getElementById("save-button").addEventListener("click", async () => {
  const alertBox = document.getElementById("alert-box");
  alertBox.alert("Saving...", NOTIFICATION);
  await save();
  alertBox.hide();
});

// Next Button
// 1. Check if Project Name Inputted
// 2. Check if Site Designation is Selected
// 3.Check if Importance Category is Selected
// 4. Send Select Importance Category to Backend
document.getElementById("next-button").addEventListener("click", async () => {
  const projectNameInput = document.getElementById("project-name");
  const projectNameValue = projectNameInput.value;
  const importanceCategorySelect = document.getElementById(
    "importance-category-select"
  );
  const importanceCategory = importanceCategorySelect.value;
  console.log({ importanceCategory, projectNameValue, isLocationDataSet });

  if (!projectNameValue) {
    const alertBox = document.getElementById("alert-box");
    alertBox.alert("Please Choose A Project Name");
    return;
  }
  if (!isLocationDataSet) {
    const alertBox = document.getElementById("alert-box");
    alertBox.alert("Please Hit the Get Sesmic and Climate Data Button");
    return;
  }

  if (!importanceCategory) {
    const alertBox = document.getElementById("alert-box");
    alertBox.alert("Please Choose An Importance Category");
    return;
  }

  const alertBox = document.getElementById("alert-box");
  alertBox.alert("Proccessing and Saving data", NOTIFICATION);
  // Sending importance category to backend
  await importanceCategoryCall(importanceCategory);
  await save();
  alertBox.hide();
  window.location.href = "building_geometry.html";
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// API Calls
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function locationCall(address, siteDesignation, seismicValue) {
  try {
    const connectionAddress = await window.api.invoke("get-connection-address");

    const token = await window.api.invoke("get-token");

    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Accept", "application/json");
    headers.append("Authorization", `Bearer ${token}`);

    const body = JSON.stringify({
      address: `${address}`,
      site_designation: `${siteDesignation}`,
      seismic_value: `${seismicValue}`,
    });

    const request = {
      method: "POST",
      headers,
      body,
      redirect: "follow",
    };

    console.log({ request });
    const response = await fetch(`${connectionAddress}/location`, request);
    result = await response.json();
    console.log({ result });
    return result;
  } catch (error) {
    console.error({ error });
    return {};
  }
}

async function importanceCategoryCall(importanceCategory) {
  try {
    const connectionAddress = await window.api.invoke("get-connection-address");

    const token = await window.api.invoke("get-token");

    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Accept", "application/json");
    headers.append("Authorization", `Bearer ${token}`);

    const body = JSON.stringify({
      importance_category: importanceCategory,
    });

    const request = {
      method: "POST",
      headers,
      body,
      redirect: "follow",
    };

    console.log({ request });
    const response = await fetch(
      `${connectionAddress}/importance_category`,
      request
    );
  } catch (error) {
    console.error({ error });
    return;
  }
}

async function save() {
  try {
    const connectionAddress = await window.api.invoke("get-connection-address");
    const token = await window.api.invoke("get-token");

    // Getting the project name from the HTML
    let projectName = document.getElementById("project-name").value.trim();
    projectName = projectName || "New Project";

    const headers = new Headers();
    headers.append("Accept", "application/json");
    headers.append("Authorization", `Bearer ${token}`);

    // Step 1: Fetch the current save file ID
    const getSaveFileRequestOptions = {
      method: "POST",
      headers: headers,
      redirect: "follow",
    };

    const saveFileResponse = await fetch(
      `${connectionAddress}/get_user_current_save_file`,
      getSaveFileRequestOptions
    );

    if (saveFileResponse.status !== 200) {
      throw new Error("Failed to fetch the current save file ID");
    }

    const result = await saveFileResponse.json();
    const saveFileId = parseInt(result);

    // Step 2: Save the JSON data with the project name
    headers.append("Content-Type", "application/json");

    const body = JSON.stringify({
      json_data: JSON.stringify({ projectName }),
      id: saveFileId,
    });

    const saveDataRequestOptions = {
      method: "POST",
      headers: headers,
      body: body,
      redirect: "follow",
    };

    const saveDataResponse = await fetch(
      `${connectionAddress}/set_user_save_data`,
      saveDataRequestOptions
    );

    if (saveDataResponse.status !== 200) {
      throw new Error("Failed to save the project data");
    }

    const saveResult = await saveDataResponse.text();
    console.log("Save successful:", saveResult);
  } catch (error) {
    console.error("Error saving data:", error);
  }
}
