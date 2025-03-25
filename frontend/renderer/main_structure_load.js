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
// CE_VALUES
const OPEN = "OPEN";
const ROUGH = "ROUGH";
const INTERMEDIATE = "INTERMEDIATE";

const ULS = "ULS";
const SLS = "SLS";

const WINDWARD = "WINDWARD";
const LEEWARD = "LEEWARD";
const SIDE_WALLS = "SIDEWALLS";

let NUM_ZONES;
let isPCalculated = false;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ON PAGE LOAD (First Function Ran)
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

window.onload = async function () {
  let NUM_ZONES = await getNumHeightZones();
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Events and Defined Event Functions
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
document.getElementById("ce-select").addEventListener("change", function () {
  const intermediateContainer = document.getElementById(
    "ce-intermediate-container"
  );
  const intermediateInput = document.getElementById("ce-intermediate-value");

  if (this.value === INTERMEDIATE) {
    intermediateContainer.classList.remove("hidden");
    intermediateContainer.classList.add("visible");
    intermediateInput.focus();
  } else {
    intermediateContainer.classList.remove("visible");
    intermediateContainer.classList.add("hidden");
    intermediateInput.value = ""; // Clear input when hidden
  }
});

document
  .getElementById("calculate")
  .addEventListener("click", async function () {
    const alertbox = document.getElementById("alert-box");
    const calculationsTable = document.getElementById(
      "wind-pressure-factors-table"
    );
    const exposureFactor = document.getElementById("ce-select").value;
    if (![OPEN, ROUGH, INTERMEDIATE].includes(exposureFactor)) {
      alertbox.alert("Please select an exposure factor");
      return;
    }

    const cei = parseFloat(
      document.getElementById("ce-intermediate-value").value
    );

    if (!cei && exposureFactor == INTERMEDIATE) {
      alertbox.alert("Please input an intermediate ce value");
      return;
    }

    const ct = parseFloat(document.getElementById("ct-input").value);

    if (!ct) {
      alertbox.alert("Please input a ct Value");
      return;
    }

    const ulsSlsChoice = document.getElementById(
      "uls-sls-selection-select"
    ).value;
    if (![ULS, SLS].includes(ulsSlsChoice)) {
      alertbox.alert("Please select either ULS or SLS");
      return;
    }

    const faceChoice = document.getElementById(
      "face-selection-selection-select"
    ).value;
    if (![WINDWARD, LEEWARD, SIDE_WALLS].includes(faceChoice)) {
      alertbox.alert("Please select a face (typically value is Windward)");
      return;
    }

    console.log({ inputs: { ct, ce, cei, ulsSlsChoice, faceChoice } });

    const calculated_values = await calculateMainStructureWindFactorCall(
      ct,
      exposureFactor,
      cei
    );

    console.log({ calculated_values });

    alertbox.alert("Calculating...", NOTIFICATION);

    const windwardUlsData = calculated_values.map(
      ({ ce_windward, cg_uls, cp_windward, p_windward_uls }) => {
        return {
          Ce: ce_windward,
          Cg: cg_uls,
          Cp: cp_windward,
          p: p_windward_uls,
        };
      }
    );
    const leewardUlsData = calculated_values.map(
      ({ ce_leeward, cg_uls, cp_leeward, p_leeward_uls }) => {
        return { Ce: ce_leeward, Cg: cg_uls, Cp: cp_leeward, p: p_leeward_uls };
      }
    );
    const sideWallsUlsData = calculated_values.map(
      ({ ce_side_walls, cg_uls, cp_side_walls, p_side_walls_uls }) => {
        return {
          Ce: ce_side_walls,
          Cg: cg_uls,
          Cp: cp_side_walls,
          p: p_side_walls_uls,
        };
      }
    );

    const windwardSlsData = calculated_values.map(
      ({ ce_windward, cg_sls, cp_windward, p_windward_sls }) => {
        return {
          Ce: ce_windward,
          Cg: cg_sls,
          Cp: cp_windward,
          p: p_windward_sls,
        };
      }
    );
    const leewardSlsData = calculated_values.map(
      ({ ce_leeward, cg_sls, cp_leeward, p_leeward_sls }) => {
        return { Ce: ce_leeward, Cg: cg_sls, Cp: cp_leeward, p: p_leeward_sls };
      }
    );
    const sideWallsSlsData = calculated_values.map(
      ({ ce_side_walls, cg_sls, cp_side_walls, p_side_walls_sls }) => {
        return {
          Ce: ce_side_walls,
          Cg: cg_sls,
          Cp: cp_side_walls,
          p: p_side_walls_sls,
        };
      }
    );

    let factors;

    if (ulsSlsChoice == ULS && faceChoice == WINDWARD) {
      factors = windwardUlsData;
    } else if (ulsSlsChoice == SLS && faceChoice == WINDWARD) {
      factors = windwardSlsData;
    } else if (ulsSlsChoice == ULS && faceChoice == LEEWARD) {
      factors = leewardUlsData;
    } else if (ulsSlsChoice == SLS && faceChoice == LEEWARD) {
      factors = leewardSlsData;
    } else if (ulsSlsChoice == ULS && faceChoice == SIDE_WALLS) {
      factors = sideWallsUlsData;
    } else if (ulsSlsChoice == SLS && faceChoice == SIDE_WALLS) {
      factors = sideWallsSlsData;
    }

    // only displaying pressure values (this is a big hack)
    const headers = ["Height Zone", ...Object.keys(factors[0])];

    const data = factors.map((factors, index) => {
      const formattedFactors = Object.values(factors).map((value) =>
        parseFloat(value.toFixed(3))
      );

      return [index + 1, ...formattedFactors];
    });

    console.log({ headers, data });

    // Render the table with updated headers and data
    calculationsTable.render(headers, data);

    isPCalculated = true;
    alertbox.alert("Successfully Calculated Pressure!", SUCCESS);
  });

// Next Button
document.getElementById("next-button").addEventListener("click", async () => {
  const alertbox = document.getElementById("alert-box");

  if (!isPCalculated) {
    alertbox.alert("Please Click Calcualate");
    return;
  }
  window.location.href = "main_structure_results.html";
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// API Calls
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Get the number of height zones
 * @returns {Promise<number>}
 */
async function getNumHeightZones() {
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
    console.log({
      result: Object.keys(JSON.parse(result)),
      length: Object.keys(JSON.parse(result)).length,
    });
    return Object.keys(JSON.parse(result)).length;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

async function calculateMainStructureWindFactorCall(
  ct,
  exposureFactor,
  manualCeCei = null
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

    // Construct the request body based on MainStructureWindFactorInput model
    console.log({
      ct,
      exposure_factor: exposureFactor.toLowerCase(),
      manual_ce_cei: manualCeCei,
    });
    const body = JSON.stringify({
      ct,
      exposure_factor: exposureFactor.toLowerCase(),
      manual_ce_cei: manualCeCei,
    });

    console.log({ body }); // Debugging: log the request body

    // Configure request options
    const requestOptions = {
      method: "POST",
      headers,
      body,
      redirect: "follow",
    };

    // Make the API call to the FastAPI endpoint
    const response = await fetch(
      `${connectionAddress}/calculate_main_structure_wind_factor`,
      requestOptions
    );

    console.log({ response }); // Debugging: log the response object

    // Parse and return the JSON response
    if (response.ok) {
      const result = await response.json();
      return result;
    } else {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error calculating main structure wind factor:", error);
  }
}
