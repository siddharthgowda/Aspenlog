/** site_designation_input.js
 * Users will select the site designation and site class here.
 * Please refer to the LICENSE and DISCLAIMER files for more information regarding the use and distribution of this code.
 * By using this code, you agree to abide by the terms and conditions in those files.
 * Author: Siddharth Gowda [https://github.com/siddharthgowda]
 **/

const componentStyleSiteDesignationInput = `
  <style>
    body {
      background-color: #f7f4ef;
    }

    label {
      font-weight: bold;
      color: #707070;
      display: block;
      margin-bottom: 5px;
    }

    select {
      width: 100%;
      padding: 10px 15px;
      margin: 10px 0;
      border: 2px solid #d9d9d9;
      border-radius: 12px;
      background-color: #f7f4ef;
      color: #707070;
      font-size: 1rem;
      appearance: none;
    }

    select:hover {
      border-color: #ccac81;
    }

    select:focus {
      outline: none;
      border-color: #9bca6d;
      box-shadow: 0px 0px 5px rgba(155, 202, 109, 0.5);
    }

    input[type="number"] {
      width: 100%;
      padding: 10px 15px;
      margin: 10px 0;
      border: 2px solid #d9d9d9;
      border-radius: 12px;
      background-color: #f7f4ef;
      color: #707070;
      font-size: 1rem;
    }

    input[type="number"]:hover {
      border-color: #ccac81;
    }

    input[type="number"]:focus {
      outline: none;
      border-color: #9bca6d; /* Highlight border on focus */
    }

    /* Hidden and Visible Classes for Toggle Functionality */
    .hidden {
      display: none;
    }

    .visible {
      display: block;
    }
    
    .toggle-button {
      cursor: pointer;
      padding: 10px 20px;
      background-color: #9bca6d;
      border: none;
      border-radius: 8px;
      color: white;
      font-weight: bold;
    }

    .toggle-button:hover {
      background-color: #85b05a;
    }
    
    .toggle-button + .toggle-button {
        margin-left: 10px;
    }
    
   </style>
`;

const componentHTMLSiteDesignationInput = `
  ${componentStyleSiteDesignationInput}
  <div>
    <button class="toggle-button" id="XsButton">Site Class Xs</button>
    <button class="toggle-button" id="XvButton">Vs30</button>

    <div id="XsDropdown" class="hidden">
      <label for="siteDesignation">Site Class (A-E):</label>
      <select id="siteDesignation">
        <option value="">Select...</option>
        <option value="A">A</option>
        <option value="B">B</option>
        <option value="C">C</option>
        <option value="D">D</option>
        <option value="E">E</option>
      </select>
    </div>

    <div id="XvInput" class="hidden">
      <label for="siteClass" type="number">Value Measured in Situ Between 140 - 3000 m/s</label>
      <input type="number" id="siteClass" placeholder="Enter site class">
    </div>
  </div>
`;

class SiteDesignationInput extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = componentHTMLSiteDesignationInput;

    // State to track current selection
    this.currentSelection = null;
  }

  connectedCallback() {
    // Cache references to elements
    this.XsButton = this.shadowRoot.querySelector("#XsButton");
    this.XvButton = this.shadowRoot.querySelector("#XvButton");
    this.XsDropdown = this.shadowRoot.querySelector("#XsDropdown");
    this.XvInput = this.shadowRoot.querySelector("#XvInput");
    this.siteDesignationSelect =
      this.shadowRoot.querySelector("#siteDesignation");
    this.siteClassInput = this.shadowRoot.querySelector("#siteClass");

    // Add event listeners
    this.XsButton.addEventListener("click", () => this.toggleVisibility("Xs"));
    this.XvButton.addEventListener("click", () =>
      this.toggleVisibility("Vs30")
    );
    this.siteDesignationSelect.addEventListener("change", () =>
      this.updateSelection("Xs")
    );
    this.siteClassInput.addEventListener("input", () =>
      this.updateSelection("Vs30")
    );
  }

  /**
   * Toggles visibility between Xs dropdown and Vs30 input.
   * @param {string} type - The type of input to show ("Xs" or "Vs30").
   */
  toggleVisibility(type) {
    if (type === "Xs") {
      // Show Xs dropdown and hide Vs30 input
      this.XsDropdown.classList.remove("hidden");
      this.XsDropdown.classList.add("visible");
      this.XvInput.classList.remove("visible");
      this.XvInput.classList.add("hidden");

      // Reset Vs30 input
      this.siteClassInput.value = "";
      this.currentSelection = null;
    } else if (type === "Vs30") {
      // Show Vs30 input and hide Xs dropdown
      this.XvInput.classList.remove("hidden");
      this.XvInput.classList.add("visible");
      this.XsDropdown.classList.remove("visible");
      this.XsDropdown.classList.add("hidden");

      // Reset Xs dropdown
      this.siteDesignationSelect.value = "";
      this.currentSelection = null;
    }
  }

  /**
   * Updates the current selection based on user input.
   * @param {string} type - The type of input ("Xs" or "Vs30").
   */
  updateSelection(type) {
    if (type === "Xs") {
      const selectedValue = this.siteDesignationSelect.value;
      if (selectedValue) {
        // Update state with Xs selection
        this.currentSelection = {
          siteDesignation: "xs",
          seismicValue: selectedValue,
        };
      } else {
        console.warn("No value selected in Xs dropdown.");
        this.currentSelection = null;
      }
    } else if (type === "Vs30") {
      const inputValue = this.siteClassInput.value.trim();
      if (!isNaN(inputValue) && inputValue !== "") {
        // Update state with Vs30/Xv selection
        this.currentSelection = {
          siteDesignation: "xv",
          seismicValue: Number(inputValue),
        };
      } else {
        console.warn("Invalid number entered in Vs30 input.");
        this.currentSelection = null;
      }
    }
  }

  /**
   * Retrieves the current result data.
   * @returns {object|null} - The current selection object or null if no valid data exists.
   */
  data() {
    if (this.currentSelection) {
      const { siteDesignation, seismicValue } = this.currentSelection;
      console.log({ siteDesignation, seismicValue });

      // Validate Xs (Site Designation)
      if (
        siteDesignation === "xs" &&
        ["A", "B", "C", "D", "E"].includes(seismicValue)
      ) {
        return { ...this.currentSelection };
      }

      // Validate Vs30/Xv (Site Class)
      if (
        siteDesignation === "xv" &&
        seismicValue >= 140 &&
        seismicValue <= 3000
      ) {
        return { ...this.currentSelection };
      }
    }

    return null;
  }

  /**
   * Sets the current selection based on user saved input.
   * @param {string} type - The type of input ("xs" or "xv").
   * @param {string|number} value - The value of the input ("A", "B", "C", "D", "E" for "xs" or a number for "xv").
   */
  setData(type, value) {
    this.currentSelection = {
      siteDesignation: type,
      seismicValue: value,
    };

    if (type === "xs") {
      // Show Xs dropdown and hide Vs30 input
      this.XsDropdown.classList.remove("hidden");
      this.XsDropdown.classList.add("visible");
      this.XvInput.classList.remove("visible");
      this.XvInput.classList.add("hidden");

      // Update Xs dropdown selection
      this.siteDesignationSelect.value = value;
    } else if (type === "xv") {
      // Show Vs30 input and hide Xs dropdown
      this.XvInput.classList.remove("hidden");
      this.XvInput.classList.add("visible");
      this.XsDropdown.classList.remove("visible");
      this.XsDropdown.classList.add("hidden");

      // Update Vs30 input value
      this.siteClassInput.value = value;
    }
  }
}

customElements.define("site-designation-input", SiteDesignationInput);
