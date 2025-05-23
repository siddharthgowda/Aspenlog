////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// engineer_selection.js
// This file contains the scripts for the engineer_selection for the frontend.
// The file main purpose is for the user to choose which type of engineer they are
// and then send them to the appriate load factor page accordingly
//
// Please refer to the LICENSE and DISCLAIMER files for more information regarding the use and distribution of this code
// By using this code, you agree to abide by the terms and conditions in those files.
//
// Author: Siddharth Gowda [https://github.com/siddharth]
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// GLOBALS & CONSTANTS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// these need to same as the value in engineer_selection.html engineering type dropdown
const MAIN_ENGINEER = "MAIN";
const WALL_CLADDING_ENGINEER = "WALL_CLADDING";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ON PAGE LOAD (First Function Ran)
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

window.onload = function () {};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Events and Defined Event Functions
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Next Button
// 1. Validate All Inputs in the Field are Valid
// Send Building Geometry and Height Zone Information to backend
// Go to Next Page (choose engineer type)
document.getElementById("next-button").addEventListener("click", () => {
  const alertBox = document.getElementById("alert-box");
  const engineerDropdown = document.getElementById("engineer-dropdown");

  if (engineerDropdown.value == MAIN_ENGINEER) {
    window.location.href = "main_structure_load.html";
  } else if (engineerDropdown.value == WALL_CLADDING_ENGINEER) {
    window.location.href = "wall_cladding_load.html";
  } else {
    alertBox.alert("Please choose an engineering type");
  }
});
