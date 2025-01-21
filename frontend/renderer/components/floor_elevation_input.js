const floorElevationTableStyle = `
  <style>
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 10px 0;
    }

    th, td {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
    }

    th {
      background-color: #f4f4f4;
      font-weight: bold;
    }

    input {
      width: 100%;
      box-sizing: border-box;
    }
  </style>
`;

const floorElevationTableHTML = `
${floorElevationTableStyle}
  <table>
    <thead></thead>
    <tbody></tbody>
  </table>
`;

class FloorElevationTable extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = floorElevationTableHTML;
    this.numberOfFloors = 0;
    this.elevationData = [];
  }

  render(floors) {
    if (!Number.isInteger(floors) || floors <= 0) {
      console.error(
        "Invalid number of floors. Please provide a positive integer."
      );
      return;
    }

    this.numberOfFloors = floors;
    this.elevationData = Array(floors).fill(null);

    const tableHead = this.shadowRoot.querySelector("thead");
    const tableBody = this.shadowRoot.querySelector("tbody");

    tableHead.innerHTML = "";
    tableBody.innerHTML = "";

    const headerRow = document.createElement("tr");
    ["Floor Number", "Elevation (m)"].forEach((header) => {
      const th = document.createElement("th");
      th.textContent = header;
      headerRow.appendChild(th);
    });
    tableHead.appendChild(headerRow);

    // PLEASE SEE!
    // Content is displayed to user in reverse (from floor n to floor 1)
    // put stored in component in order of floor 1 to floor n

    for (let i = floors - 1; i >= 0; i--) {
      const row = document.createElement("tr");

      const floorCell = document.createElement("td");
      floorCell.textContent = i + 1;
      row.appendChild(floorCell);

      const elevationCell = document.createElement("td");
      const input = document.createElement("input");
      input.type = "number";
      input.min = "0";
      input.step = "0.01";
      input.placeholder = "Enter elevation";
      input.addEventListener("input", (e) => {
        this.elevationData[i] = parseFloat(e.target.value) || null;
      });
      elevationCell.appendChild(input);
      row.appendChild(elevationCell);

      tableBody.appendChild(row);
    }
  }

  data() {
    return this.elevationData.map((elevation, index) => ({
      floor: index + 1,
      elevation,
    }));
  }

  validateData() {
    console.log({ evd: this.elevationData });
    for (let i = 1; i < this.elevationData.length; i++) {
      if (
        this.elevationData[i] !== null &&
        this.elevationData[i - 1] !== null &&
        this.elevationData[i] < this.elevationData[i - 1]
      ) {
        return false;
      }
    }
    return true;
  }
}

const floorElevationInputStyle = `
  <style>
    .visible {
      display: block;
    }

    .mb-3 {
      margin-bottom: 1rem;
    }

    .form-control {
      width: 100%;
      padding: 0.375rem 0.75rem;
      font-size: 1rem;
      line-height: 1.5;
      color: #495057;
      background-color: #f7f4ef;
      background-clip: padding-box;
      border: 1px solid #dee2e6;
      border-radius: 0.25rem;
    }

    .btn-primary {
    color: #fff;
    width: 20%;
    margin: 0 auto;
    border: transparent;
    background-color: #9bca6d;
    border-radius: 12px;
    font-weight: bold;
    padding: 0.375rem 0.75rem;
    }

    .btn-primary:hover {
    background-color: #85b05a;
    }
    label {
        font-weight: bold;
        color: #707070;
        display: block;
        margin-bottom: 5px;
    }
  </style>
`;

const floorElevationInputHTML = `
${floorElevationInputStyle}
  <div class="mb-3">
    <label for="num-floors">Number of Floors</label>
    <p>This will be used in seismic calculation.</p>
    <input class="form-control" id="num-floors" type="number" name="num_floors" />
  </div>
  <div class="mb-3">
    <label for="sea-level">Height of Sea/Ground Level</label>
    <p>This will be used when calculating floor dimensions.</p>
    <input class="form-control" id="sea-level" type="number" name="sea_level" />
  </div>
  <div class="mb-3 hidden" id="floor-elevation-table-container">
    <floor-elevation-table id="floor-elevation-table"></floor-elevation-table>
  </div>
  <div class="mb-3">
    <button class="btn btn-primary" id="floor-elevation-button">Enter Floor Elevation Table</button>
  </div>
`;

class FloorElevationInput extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = floorElevationInputHTML;

    this.shadowRoot
      .getElementById("floor-elevation-button")
      .addEventListener("click", this.handleButtonClick.bind(this));
  }

  handleButtonClick() {
    const numFloorsInput = this.shadowRoot.getElementById("num-floors");
    const seaLevelInput = this.shadowRoot.getElementById("sea-level");
    const numFloorsValue = parseInt(numFloorsInput.value, 10);
    const seaLevelValue = parseFloat(seaLevelInput.value);

    if (!numFloorsValue || numFloorsValue <= 0 || isNaN(seaLevelValue)) {
      console.error("Invalid input for number of floors or sea level.");
      return;
    }

    const tableContainer = this.shadowRoot.getElementById(
      "floor-elevation-table-container"
    );
    const tableComponent = this.shadowRoot.getElementById(
      "floor-elevation-table"
    );

    tableContainer.classList.remove("hidden");
    tableContainer.classList.add("visible");
    tableComponent.render(numFloorsValue);
  }

  data() {
    const numFloors = parseInt(
      this.shadowRoot.getElementById("num-floors").value,
      10
    );
    const seaLevel = parseFloat(
      this.shadowRoot.getElementById("sea-level").value
    );
    const tableData = this.shadowRoot
      .getElementById("floor-elevation-table")
      .data();

    return { numFloors, seaLevel, tableData };
  }

  validateData() {
    const numFloors = parseInt(
      this.shadowRoot.getElementById("num-floors").value,
      10
    );
    const seaLevel = parseFloat(
      this.shadowRoot.getElementById("sea-level").value
    );
    const tableComponent = this.shadowRoot.getElementById(
      "floor-elevation-table"
    );

    if (!Number.isInteger(numFloors) || numFloors <= 0) {
      console.error("Invalid number of floors.");
      return false;
    }

    if (isNaN(seaLevel)) {
      console.error("Sea level value must be a number.");
      return false;
    }

    if (!tableComponent.validateData()) {
      console.error(
        "Floor elevations are invalid. They must increase progressively."
      );
      return false;
    }

    const tableData = tableComponent.data();
    if (tableData.length > 0 && tableData[0].elevation <= seaLevel) {
      console.error(
        "The first floor elevation must be greater than the sea level."
      );
      return false;
    }

    return true;
  }
}

customElements.define("floor-elevation-table", FloorElevationTable);
customElements.define("floor-elevation-input", FloorElevationInput);
