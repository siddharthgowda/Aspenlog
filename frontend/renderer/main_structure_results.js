////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// mainStructure/wind.js
// This file contains the scripts for the wind load inputs and partial calculations for the frontend.
// The file main purpose is for form validation for user inputs for wind load calculations
//
// Please refer to the LICENSE and DISCLAIMER files for more information regarding the use and distribution of this code
// By using this code, you agree to abide by the terms and conditions in those files.
//
// Author: Siddharth Gowda [https://github.com/siddharth]
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// GLOBALS & CONSTANTS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const ULS = "ULS";
const SLS = "SLS";

const WINDWARD = "WINDWARD";
const LEEWARD = "LEEWARD";
const SIDE_WALLS = "SIDE_WALLS";

// Properly initialize WIND_LOADS_MAP as a nested object
let WIND_LOADS_MAP = {
  [WINDWARD]: { [ULS]: {}, [SLS]: {} },
  [LEEWARD]: { [ULS]: {}, [SLS]: {} },
  [SIDE_WALLS]: { [ULS]: {}, [SLS]: {} },
};

let isCalculated = false;

HEADERS = ["Height Zone", "Ce", "Cg", "Cp", "Wind p", "Total Load (KN)"];

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ON PAGE LOAD (First Function Ran)
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

window.onload = async function () {
  try {
    // Fetch zones data
    const zones = await getHeightZones();
    console.log(zones);

    // Extract wind load values from zones
    const wind_load_values = Object.values(zones).map(
      (zone) => zone.main_structure_wind_factor
    );

    // Define mapping rules for ULS and SLS
    const mappingRules = {
      [WINDWARD]: {
        [ULS]: ({ ce_windward, cg_uls, cp_windward, p_windward_uls }) => ({
          Ce: ce_windward,
          Cg: cg_uls,
          Cp: cp_windward,
          p: p_windward_uls,
        }),
        [SLS]: ({ ce_windward, cg_sls, cp_windward, p_windward_sls }) => ({
          Ce: ce_windward,
          Cg: cg_sls,
          Cp: cp_windward,
          p: p_windward_sls,
        }),
      },
      [LEEWARD]: {
        [ULS]: ({ ce_leeward, cg_uls, cp_leeward, p_leeward_uls }) => ({
          Ce: ce_leeward,
          Cg: cg_uls,
          Cp: cp_leeward,
          p: p_leeward_uls,
        }),
        [SLS]: ({ ce_leeward, cg_sls, cp_leeward, p_leeward_sls }) => ({
          Ce: ce_leeward,
          Cg: cg_sls,
          Cp: cp_leeward,
          p: p_leeward_sls,
        }),
      },
      [SIDE_WALLS]: {
        [ULS]: ({
          ce_side_walls,
          cg_uls,
          cp_side_walls,
          p_side_walls_uls,
        }) => ({
          Ce: ce_side_walls,
          Cg: cg_uls,
          Cp: cp_side_walls,
          p: p_side_walls_uls,
        }),
        [SLS]: ({
          ce_side_walls,
          cg_sls,
          cp_side_walls,
          p_side_walls_sls,
        }) => ({
          Ce: ce_side_walls,
          Cg: cg_sls,
          Cp: cp_side_walls,
          p: p_side_walls_sls,
        }),
      },
    };

    // Populate WIND_LOADS_MAP dynamically for both ULS and SLS
    Object.keys(mappingRules).forEach((key) => {
      Object.keys(mappingRules[key]).forEach((state) => {
        WIND_LOADS_MAP[key][state] = wind_load_values.map(
          mappingRules[key][state]
        );
      });
    });

    // Log results for debugging
    console.log("Wind Load Values:", wind_load_values);
    console.log("WIND_LOADS_MAP:", WIND_LOADS_MAP);
  } catch (error) {
    console.error("Error fetching or processing height zones:", error);
  }
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Events and Defined Event Functions
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
document
  .getElementById("calculate")
  .addEventListener("click", async function () {
    const alertbox = document.getElementById("alert-box");
    const faceDropdown = document.getElementById("face-select");
    const combinationDropdown = document.getElementById("combination-select");
    const combinationTable = document.getElementById("load-combinations-table");

    if (!faceDropdown.value || !combinationDropdown.value) {
      alertbox.alert("Please select a combination and a face");
      return;
    }
    const {
      type: ulsOrSls,
      D: deadCoef,
      L: liveCoef,
      W: windCoef,
    } = JSON.parse(combinationDropdown.value);
    console.log({
      faceDropdown: faceDropdown.value,
      combinationCoefficients: JSON.parse(combinationDropdown.value),
    });

    const loads = await calculateMainStructureLoadsCall(
      ulsOrSls,
      faceDropdown.value,
      deadCoef,
      liveCoef,
      windCoef
    );
    console.log({ loads });
    const data = WIND_LOADS_MAP[faceDropdown.value][ulsOrSls].map(
      ({ Ce, Cg, Cp, p }, index) => {
        return [
          index + 1,
          parseFloat(Ce.toFixed(3)),
          parseFloat(Cg.toFixed(3)),
          parseFloat(Cp.toFixed(3)),
          parseFloat(p.toFixed(3)),
          parseFloat(loads[index].toFixed(3)),
        ];
      }
    );

    console.log({ data });

    // const HEADERS = [
    //   "Height Zone",
    //   "Ce",
    //   "Cg",
    //   "Cp",
    //   "Wind p",
    //   "Total Load (KN)",
    // ];

    combinationTable.render(HEADERS, data);
    isCalculated = true;
  });

document.getElementById("export-button").addEventListener("click", async () => {
  const alertbox = document.getElementById("alert-box");
  if (!isCalculated) {
    alertbox.alert("Click Calculate before exporting");
    return;
  }
  alertbox.alert("Exporting...", NOTIFICATION);
  const combinationTable = document.getElementById("load-combinations-table");
  const { headers, matrixData: data } = combinationTable.data();
  exportToCSV(headers, data);
  alertbox.alert("Successfully downloaded!", SUCCESS);
});

function exportToCSV(headers, data, filename = "results.csv") {
  //Create the CSV content
  const csvContent = [
    headers.join(","),
    ...data.map((row) => row.join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

  //Create a link element to download the Blob
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);

  //Append the link to the document and trigger the download
  document.body.appendChild(link);
  link.click();

  //Clean up by revoking the object URL and removing the link
  URL.revokeObjectURL(url);
  document.body.removeChild(link);
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// API Calls
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Get the data for all height zones
 * @returns {Promise<object>}
 */
async function getHeightZones() {
  try {
    const connectionAddress = await window.api.invoke("get-connection-address");
    const token = await window.api.invoke("get-token");

    const response = await fetch(`${connectionAddress}/get_height_zones`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      redirect: "follow",
    });

    const result = await response.json();
    return JSON.parse(result);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

/**
 * Calls the `/calculate_main_structure_loads` API to calculate loads for the main structure.
 *
 * @param {string} windFace - The face of the structure ("windward, eeward, side walls).
 * @param {string} ulsOrSls - The load type (ULS, SLS).
 * @param {number} deadCoef - The coefficient for dead load.
 * @param {number} liveCoef - The coefficient for live load.
 * @param {number} windCoef - The coefficient for wind load.
 * @param {number|null} snowCoef - The coefficient for snow load (optional).
 * @param {number|null} seismicCoef - The coefficient for seismic load (optional).
 * @returns {Promise<Object>} - A promise that resolves to the API response containing calculated loads.
 */
async function calculateMainStructureLoadsCall(
  ulsOrSls,
  windFace,
  deadCoef = null,
  liveCoef = null,
  windCoef = null,
  snowCoef = null,
  seismicCoef = null
) {
  try {
    // Fetch connection address and token from the client-side API
    const connectionAddress = await window.api.invoke("get-connection-address");
    const token = await window.api.invoke("get-token");

    // Set up headers for the request
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Accept", "application/json");
    headers.append("Authorization", `Bearer ${token}`);

    // Construct the request body
    const body = JSON.stringify({
      dead_coef: deadCoef,
      live_coef: liveCoef,
      wind_coef: windCoef,
      wind_face: windFace,
      uls_or_sls: ulsOrSls,
      snow_coef: snowCoef,
      seismic_coef: seismicCoef,
    });

    // Configure request options
    const requestOptions = {
      method: "POST",
      headers,
      body,
      redirect: "follow",
    };

    // Make the API call to the FastAPI endpoint
    console.log("[DEBUG] Sending API request...");
    const response = await fetch(
      `${connectionAddress}/calculate_main_structure_loads`,
      requestOptions
    );

    console.log("[DEBUG] Response Object:", response); // Debugging: log the response object

    // Parse and return the JSON response if successful
    if (response.ok) {
      const result = await response.json();
      console.log("[DEBUG] API Response:", result);
      return result;
    } else {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  } catch (error) {
    console.error("❌ ERROR: Failed to calculate main structure loads.");
    console.error("Error Details:", error.message);
  }
}
