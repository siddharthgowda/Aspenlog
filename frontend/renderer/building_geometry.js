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

// Display Height Zone Table if all height zone related data is inputted and is valid
document
  .getElementById("height-zone-button")
  .addEventListener("click", async () => {
    const alertbox = document.getElementById("alert-box");
    const floorElevationInput = document.getElementById(
      "floor-elevation-input"
    );
    const heightZoneTable = document.getElementById("height-zone-table");
    const heightZoneTableContainer = document.getElementById(
      "height-zone-table-container"
    );

    console.log({
      valid: floorElevationInput.validateData(),
      data: floorElevationInput.data(),
    });

    if (!floorElevationInput.validateData()) {
      alertbox.alert(
        "Please Enter Valid Floor Elevations. Ensure that Sea Level < all floor elevations"
      );
      return;
    }

    const floorsElevationData = floorElevationInput
      .data()
      .tableData.map(({ floor, elevation }) => {
        const seaLevel = floorElevationInput.data().seaLevel;
        return [floor, elevation - seaLevel];
      });

    heightZoneTableContainer.classList.remove("hidden");
    heightZoneTableContainer.classList.remove("visible");
    heightZoneTable.render(floorsElevationData);
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
  const alertbox = document.getElementById("alert-box");
  const floorElevationInput = document.getElementById("floor-elevation-input");

  const width = parseFloat(document.getElementById("width").value);
  if (!width || width <= 0) {
    alertbox.alert("Please Enter A Valid Width value");
    return;
  }

  if (!floorElevationInput.validateData()) {
    alertbox.alert("Please Enter valid floor elevation dimensions");
    return;
  }

  const numFloors = parseInt(floorElevationInput.data().numFloors);
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

  if (!aRoof || 0 >= aRoof || aRoof >= 360) {
    alertbox.alert("Please Enter A Valid roof angle [0, 360]");
    return;
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

  // height zone configuration and table

  const zoneTable = document.getElementById("height-zone-table");

  if (!zoneTable.validateData()) {
    alertbox.alert("Please enter valid height zone data.");
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
  const height = zoneTable.zones()[zoneTable.zones().length - 1][1];
  const dimensionResult = await dimensionsCall(width, height);
  console.log({ dimensionResult });
  const claddingResult = await claddingCall(topCladding, bottomCladding);
  console.log({ claddingResult });
  const roofResult = await roofCall(wRoof, lRoof, aRoof, deadLoadRoof);
  console.log({ roofResult });

  const zones = zoneTable.zones();
  console.log({ zones });
  const zoneWeights = zones.map(([zoneNum, elevation]) => {
    return [zoneNum, materialWeightConstant];
  });

  const buildingResult = await buildingCall(
    numFloors,
    midHeight,
    zones,
    zoneWeights
  );

  console.log({ buildingResult });

  window.location.href = "load.html";
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// API Calls
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// TODO: eaveHeight and ridgeHeight should not exists in general since it does not pertain to high rises
// this should be changed in the backend in the future
async function dimensionsCall(
  width,
  height,
  eaveHeight = null,
  ridgeHeight = null
) {
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
