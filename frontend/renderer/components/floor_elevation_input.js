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
  </style>
`;

const floorElevationTableHTML = `
${floorElevationTableStyle}
  <table>
    <thead></thead>
    <tbody></tbody>
  </table>
  <button class="btn btn-primary" id="recalculate">Recalculate</button>
`;

class FloorElevationTable extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = floorElevationTableHTML;
    this.numberOfFloors = 0;
    this.elevationData = [];
    this.typicalHeight = 0;
    this.shadowRoot
      .getElementById("recalculate")
      .addEventListener("click", () => this.recalculate());
  }

  render(floors, height) {
    if (!Number.isInteger(floors) || floors <= 0) {
      console.error("Invalid number of floors. Provide a positive integer.");
      return;
    }

    this.numberOfFloors = floors;
    this.elevationData = Array(floors).fill(null);
    this.typicalHeight = parseFloat(height) || 0;

    const tableHead = this.shadowRoot.querySelector("thead");
    const tableBody = this.shadowRoot.querySelector("tbody");
    tableHead.innerHTML = "";
    tableBody.innerHTML = "";

    const headerRow = document.createElement("tr");
    ["Floor Number", "Elevation (m)", "Typical"].forEach((header) => {
      const th = document.createElement("th");
      th.textContent = header;
      headerRow.appendChild(th);
    });
    tableHead.appendChild(headerRow);

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

      const typicalCell = document.createElement("td");
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = true;
      checkbox.addEventListener("change", () => this.recalculate());
      typicalCell.appendChild(checkbox);
      row.appendChild(typicalCell);

      tableBody.appendChild(row);
    }
  }

  recalculate() {
    let prevElevation = 0;
    const rows = this.shadowRoot.querySelectorAll("tbody tr");
    [...rows].reverse().forEach((row, index) => {
      const input = row.children[1].querySelector("input");
      const checkbox = row.children[2].querySelector("input");
      if (checkbox.checked) {
        input.value =
          index === 0 ? this.typicalHeight : prevElevation + this.typicalHeight;
        this.elevationData[index] = parseFloat(input.value);
      }
      prevElevation = this.elevationData[index];
    });
  }

  data() {
    console.log({ ed: this.elevationData });
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
    <input class="form-control" id="num-floors" type="number" name="num_floors" />
  </div>
  <div class="mb-3">
    <label for="sea-level">Height of Sea/Ground Level</label>
    <p>This will be used when calculating floor dimensions.</p>
    <input class="form-control" id="sea-level" type="number" name="sea_level" />
  </div>
  <div class="mb-3">
    <label for="typical-floor-height">Typical Floor Height</label>
    <input class="form-control" id="typical-floor-height" type="number" step="0.01" placeholder="Enter height" />
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
    const numFloorsValue = parseInt(
      this.shadowRoot.getElementById("num-floors").value,
      10
    );
    const typicalHeight = parseFloat(
      this.shadowRoot.getElementById("typical-floor-height").value
    );

    if (!numFloorsValue || numFloorsValue <= 0 || isNaN(typicalHeight)) {
      console.error(
        "Invalid input for number of floors or typical floor height."
      );
      return;
    }

    const tableComponent = this.shadowRoot.getElementById(
      "floor-elevation-table"
    );
    tableComponent.render(numFloorsValue, typicalHeight);
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
