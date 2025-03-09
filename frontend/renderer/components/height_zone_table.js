/**
 * Class representing a HeightZoneTable component.
 * This component renders a table for managing height zone information, validates user input, and processes height zones based on the input.
 */

// <script src="./components/heightzone_table.js"></script>
// <height-zone-table></height-zone-table>
// const heightZoneTable = document.querySelector('height-zone-table');
// heightZoneTable.render([[1, 100], [2, 200], [3, 300]]);
// console.log(heightZoneTable.getHeightZones());

const heightZoneTableStyle = `
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

const heightZoneTableHTML = `
${heightZoneTableStyle}
  <table>
    <thead>
      <tr>
        <th>Floor Number</th>
        <th>Elevation</th>
        <th>Height Zone</th>
      </tr>
    </thead>
    <tbody></tbody>
  </table>
`;

class HeightZoneTable extends HTMLElement {
  /**
   * Creates a HeightZoneTable instance.
   */
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = heightZoneTableHTML;
    this.data = [];
  }

  /**
   * Connected callback runs when the element is added to the DOM.
   */
  connectedCallback() {
    this.render([]);
  }

  /**
   * Renders the height zone table with the given data.
   * @param {Array<Array<number>>} data - A list of rows, where each row is an array containing floor number and elevation.
   */
  render(data) {
    this.data = data;

    const tbody = this.shadowRoot.querySelector("tbody");
    tbody.innerHTML = "";

    data.forEach((row, index) => {
      const tr = document.createElement("tr");

      const floorNumberCell = document.createElement("td");
      floorNumberCell.textContent = row[0];

      const elevationCell = document.createElement("td");
      elevationCell.textContent = row[1];

      const heightZoneCell = document.createElement("td");
      const input = document.createElement("input");
      input.type = "number";
      input.className = "height-zone-input";
      input.min = "1";
      input.max = data.length.toString();
      input.value = index + 1;
      heightZoneCell.appendChild(input);

      tr.appendChild(floorNumberCell);
      tr.appendChild(elevationCell);
      tr.appendChild(heightZoneCell);

      tbody.appendChild(tr);
    });
  }

  /**
   * Validates the height zone data input by the user.
   * @returns {boolean} - Returns true if the input data is valid, false otherwise.
   */
  validateData() {
    const rows = this.shadowRoot.querySelectorAll("tbody tr");
    let previousZone = 0;

    for (let i = 0; i < rows.length; i++) {
      const input = rows[i].querySelector(".height-zone-input");
      const value = parseInt(input.value, 10);

      if (isNaN(value) || value < 1 || value > rows.length) {
        console.error(`Invalid height zone number at row ${i + 1}.`);
        return false;
      }

      if (value < previousZone) {
        console.error(
          `Height zone numbers must be non-descending. Error at row ${i + 1}.`
        );
        return false;
      }

      previousZone = value;
    }

    return true;
  }

  /**
   * Merges floors into height zones based on user input.
   * @returns {Array<Array<number>>} - A list of height zones, where each zone is an array [height zone number, elevation].
   */
  zones() {
    if (!this.validateData()) {
      return [];
    }

    // Convert NodeList to Array to use reverse()
    const rows = Array.from(this.shadowRoot.querySelectorAll("tbody tr"));
    const zones = [];
    let currentZone = null;

    // Reverse the array of rows. This is done to ensure the last
    // occurences of a height zone is selected
    rows.reverse().forEach((row) => {
      const floorNumber = parseInt(row.children[0].textContent, 10);
      const elevation = parseFloat(row.children[1].textContent);
      const heightZone = parseInt(
        row.querySelector(".height-zone-input").value,
        10
      );

      if (!currentZone || currentZone[0] !== heightZone) {
        currentZone = [heightZone, elevation];
        zones.push(currentZone);
      }
    });

    // Reverse zones back to maintain order
    return zones.reverse().map((zone, index) => {
      return [index + 1, zone[1]];
    });
  }
}

customElements.define("height-zone-table", HeightZoneTable);
