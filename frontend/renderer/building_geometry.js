////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// buiding_geomtry.js
// This file contains the scripts for the buiding_geomtry for the frontend.
// The file main purpose is for form validation and to display height zone before the user
// enters the next page
//
// Please refer to the LICENSE and DISCLAIMER files for more information regarding the use and distribution of this code
// By using this code, you agree to abide by the terms and conditions in those files.
//
// Author: Siddharth Gowda [https://github.com/siddharth]
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// GLOBALS & CONSTANTS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ON PAGE LOAD (First Function Ran)
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

window.onload = function () {};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Events and Defined Event Functions
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// When Dropdown value changes, the correct option for inputting building
// hieght data should be displayed
document.getElementById("eave-ridge").addEventListener("change", async () => {
  const hasEaveRidge = document.getElementById("eave-ridge").value == "yes";
  const eaveRidgeContainer = document.getElementById(
    "eave-ridge-dimension-container"
  );
  const heightContainer = document.getElementById("height-container");

  if (hasEaveRidge) {
    heightContainer.classList.remove("visible");
    heightContainer.classList.add("hidden");

    eaveRidgeContainer.classList.remove("hidden");
    eaveRidgeContainer.classList.add("visible");
  } else {
    heightContainer.classList.add("visible");
    heightContainer.classList.remove("hidden");

    eaveRidgeContainer.classList.add("hidden");
    eaveRidgeContainer.classList.remove("visible");
  }
});

// Next Two Events will be used to calculate

// Display Height Zone Table if all height zone related data is inputted and is valid
document
  .getElementById("height-zone-button")
  .addEventListener("click", async () => {
    const heightZoneTable = document.getElementById("height-zone-table");
    const heightZoneTableContainer = document.getElementById(
      "height-zone-table-container"
    );

    const heightZoneValue = parseFloat(
      document.getElementById("height-zone-dimension").value
    );

    const hasEaveRidge = document.getElementById("eave-ridge").value == "yes";
    let height = -1;
    // Get and Calculate Height Value (if inputs are valid!)
    if (hasEaveRidge) {
      const eaveHeight = parseFloat(
        document.getElementById("eave-height").value
      );
      const ridgeHeight = parseFloat(
        document.getElementById("ridge-height").value
      );
      height =
        eaveHeight && ridgeHeight && eaveHeight > 0 && ridgeHeight > 0
          ? (eaveHeight + ridgeHeight) / 2
          : -1;
    } else {
      const inputtedHeight = parseFloat(
        document.getElementById("height").value
      );
      height = inputtedHeight && inputtedHeight > 0 ? inputtedHeight : -1;
    }

    console.log({ heightZoneValue, height });

    if (!heightZoneValue || heightZoneValue <= 0 || !height || height <= 0) {
      heightZoneTableContainer.classList.add("hidden");
      heightZoneTableContainer.classList.remove("visible");
      // Silently fail, user innvalid input will be notified when they try to hit next
      return;
    }

    // Create Height Zone Table
    const headers = ["Height Zone", "Elevation"];
    const numOfZones = Math.ceil(height / heightZoneValue);
    let data = [];

    for (let i = 0; i < numOfZones; i++) {
      data.push([i + 1, Math.min(height, (i + 1) * heightZoneValue)]);
    }
    console.log({
      headers,
      numOfZones,
      data,
      heightZoneTable,
    });
    heightZoneTableContainer.classList.remove("hidden");
    heightZoneTableContainer.classList.add("visible");
    heightZoneTable.render(headers, data);
  });

// If dominant hieght exists, display dropdown to input mid height information
document
  .getElementById("dominant-opening")
  .addEventListener("change", async () => {
    const hasDominantOpening =
      document.getElementById("dominant-opening").value == "yes";
    console.log({ hasDominantOpening });
    const midHeightContainer = document.getElementById("mid-height-container");
    console.log(midHeightContainer, midHeightContainer.classList);

    if (hasDominantOpening) {
      midHeightContainer.classList.remove("hidden");
      midHeightContainer.classList.add("visible");
    } else {
      midHeightContainer.classList.add("hidden");
      midHeightContainer.classList.remove("visible");
    }
  });

// Next Button
// 1. Validate All Inputs in the Field are Valid
// Send Building Geometry and Height Zone Information to backend
// Go to Next Page (choose engineer type)
document.getElementById("next-button").addEventListener("click", async () => {
  const alertbox = document.getElementById("error-alert-box");

  const width = parseFloat(document.getElementById("width").value);
  if (!width || width <= 0) {
    alertbox.alert("Please Enter A Valid Width value");
    return;
  }

  const numFloors = parseInt(document.getElementById("num-floors").value);
  if (!numFloors || numFloors <= 0) {
    alertbox.alert("Please Enter A Valid floor number value");
    return;
  }

  // cladding
  const topCladding = parseInt(document.getElementById("top-height").value);
  const bottomCladding = parseInt(
    document.getElementById("bottom-height").value
  );
  if (
    !topCladding ||
    !bottomCladding ||
    topCladding <= 0 ||
    bottomCladding <= 0 ||
    topCladding <= bottomCladding
  ) {
    alertbox.alert("Please Enter Valid Cladding Top and Bottom Information");
    return;
  }

  // dominant opening
  let midHeight = parseFloat(document.getElementById("mid-height").value);
  if (
    document.getElementById("dominant-opening").value == "Yes" &&
    (!midHeight || midHeight <= 0)
  ) {
    alertbox.alert("Please Enter Valid mid-height Information");
    return;
  } else if (document.getElementById("dominant-opening").value != "Yes") {
    midHeight = null;
  }

  // roof
  const wRoof = parseFloat(document.getElementById("w-roof").value);
  const lRoof = parseFloat(document.getElementById("l-roof").value);
  const aRoof = parseFloat(document.getElementById("a-roof").value);
  const deadLoadRoof = parseFloat(
    document.getElementById("roof-uniform-dead-load").value
  );

  if (!aRoof || 0 > aRoof || aRoof > 360) {
    alertbox.alert("Please Enter A Valid roof angle (0, 360)");
  } else if (
    !wRoof ||
    wRoof <= 0 ||
    !lRoof ||
    lRoof <= 0 ||
    wRoof >= lRoof ||
    !deadLoadRoof ||
    deadLoadRoof <= 0
  ) {
    alertbox.alert("Please Enter Valid roof information");
    return;
  }

  // eave and ridge
  let eaveHeight = parseFloat(document.getElementById("eave-height").value);
  let ridgeHeight = parseFloat(document.getElementById("ridge-height").value);
  if (
    document.getElementById("eave-ridge").value == "yes" &&
    (!eaveHeight || !ridgeHeight || eaveHeight <= 0 || ridgeHeight <= 0)
  ) {
    alertbox.alert("Please Enter Valid Eave and Ridge Information");
    return;
  }

  let height = parseFloat(document.getElementById("height").value);
  if (
    document.getElementById("eave-ridge").value != "yes" &&
    (!height || height <= 0)
  ) {
    alertbox.alert("Please enter a valid height");
    return;
  }

  // only letting either hieght or eave have a value
  if (document.getElementById("eave-ridge").value == "yes") {
    height = null;
  } else {
    eaveHeight = null;
    ridgeHeight = null;
  }

  // height zone configuration and table
  const heightZoneValue = parseFloat(
    document.getElementById("height-zone-dimension").value
  );

  if (!heightZoneValue || heightZoneValue <= 0) {
    alertbox.alert("Please enter a valid height zone size");
    return;
  }

  const zoneTable = document.getElementById("height-zone-table");
  if (zoneTable.data().matrixData == []) {
    alertbox.alert(
      "Please click the get button in the height zone configuration"
    );
    return;
  }

  // Material Weight Constant
  const materialWeightConstant = parseFloat(
    document.getElementById("material-weight-constant").value
  );

  if (!materialWeightConstant || materialWeightConstant <= 0) {
    alertbox.alert("Please enter a valid Material Weight KPA");
    return;
  }

  // Performing API Requests
  const dimensionResult = await dimensionsCall(
    width,
    height,
    eaveHeight,
    ridgeHeight
  );
  console.log({ dimensionResult });
  const claddingResult = await claddingCall(topCladding, bottomCladding);
  console.log({ claddingResult });
  const roofResult = await roofCall(wRoof, lRoof, aRoof, deadLoadRoof);
  console.log({ roofResult });

  const zones = zoneTable.data().matrixData;
  const zoneWeights = zones.map(([zoneNum, elevation]) => {
    return [zoneNum, materialWeightConstant];
  });

  const buildingResult = await buildingCall(
    numFloors,
    midHeight,
    zoneTable.data().matrixData,
    zoneWeights
  );

  console.log({ buildingResult });

  // TODO: CHANGE THIS! IT IS A TOTAL HACK
  if (buildingResult?.detail || buildingResult?.detail == "") {
    alertbox.alert(
      "Please click the get button in the height zone configuration"
    );
    return;
  }

  window.location.href = "load.html";
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// API Calls
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
async function dimensionsCall(width, height, eaveHeight, ridgeHeight) {
  try {
    const connectionAddress = await window.api.invoke("get-connection-address");
    const token = await window.api.invoke("get-token");

    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Accept", "application/json");
    headers.append("Authorization", `Bearer ${token}`);

    const body = JSON.stringify({
      width,
      height,
      eave_height: eaveHeight,
      ridge_height: ridgeHeight,
    });

    const requestOptions = {
      method: "POST",
      headers,
      body,
      redirect: "follow",
    };

    const response = await fetch(
      `${connectionAddress}/dimensions`,
      requestOptions
    );
    console.log({ response });
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error sending dimensions data:", error);
  }
}

async function claddingCall(topCladding, bottomCladding) {
  try {
    const connectionAddress = await window.api.invoke("get-connection-address");
    const token = await window.api.invoke("get-token");

    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Accept", "application/json");
    headers.append("Authorization", `Bearer ${token}`);

    const body = JSON.stringify({
      c_top: topCladding,
      c_bot: bottomCladding,
    });

    const requestOptions = {
      method: "POST",
      headers,
      body,
      redirect: "follow",
    };

    const response = await fetch(
      `${connectionAddress}/cladding`,
      requestOptions
    );
    console.log({ response });
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error sending cladding data:", error);
  }
}

async function roofCall(wRoof, lRoof, aRoof, roofUniformDeadLoad) {
  try {
    const connectionAddress = await window.api.invoke("get-connection-address");
    const token = await window.api.invoke("get-token");

    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Accept", "application/json");
    headers.append("Authorization", `Bearer ${token}`);

    const body = JSON.stringify({
      w_roof: wRoof,
      l_roof: lRoof,
      slope: aRoof,
      uniform_dead_load: roofUniformDeadLoad,
    });

    const requestOptions = {
      method: "POST",
      headers,
      body,
      redirect: "follow",
    };

    const response = await fetch(`${connectionAddress}/roof`, requestOptions);
    console.log({ response });
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error sending roof data:", error);
  }
}

async function buildingCall(numFloors, midHeight, zones, materials) {
  try {
    const connectionAddress = await window.api.invoke("get-connection-address");
    const token = await window.api.invoke("get-token");

    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    headers.append("Accept", "application/json");
    headers.append("Authorization", `Bearer ${token}`);

    const body = JSON.stringify({
      num_floor: numFloors,
      h_opening: midHeight,
      zones,
      materials,
    });

    console.log({
      num_floor: numFloors,
      h_opening: midHeight,
      zones,
      materials,
    });

    const requestOptions = {
      method: "POST",
      headers,
      body,
      redirect: "follow",
    };

    const response = await fetch(
      `${connectionAddress}/building`,
      requestOptions
    );
    console.log({ response });
    const result = await response.json();
    return result;
  } catch (error) {
    console.log({ error });
    console.error("Error sending building data:", error);
  }
}
