const customTableStyle = `
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
        </style>
`;
const customTableHTML = `
${customTableStyle}
        <table>
          <thead></thead>
          <tbody></tbody>
        </table>
`;

class CustomTable extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = customTableHTML;
    this.matrixData = [];
    this.headers = [];
  }

  /**
   * Populates the table with data from a list of headers and a matrixData (list of lists).
   * @param {Array<string>} headers - The list of column names.
   * @param {Array<Array<any>>} matrixData - The input data to render in the table.
   */
  render(headers, matrixData) {
    this.headers = headers;
    this.matrixData = matrixData;
    // Validate input
    if (!Array.isArray(headers) || !Array.isArray(matrixData)) {
      console.error(
        "Invalid data format. Headers and matrixData must be arrays."
      );
      return;
    }

    if (!matrixData.every((row) => Array.isArray(row))) {
      console.error("Invalid matrixData format. Each row must be an array.");
      return;
    }

    const tableHead = this.shadowRoot.querySelector("thead");
    const tableBody = this.shadowRoot.querySelector("tbody");

    // Clear existing content
    tableHead.innerHTML = "";
    tableBody.innerHTML = "";

    // Render header row
    const headerRow = document.createElement("tr");
    headers.forEach((header) => {
      const th = document.createElement("th");
      th.textContent = header;
      headerRow.appendChild(th);
    });
    tableHead.appendChild(headerRow);

    // Render body rows
    matrixData.forEach((row) => {
      const tr = document.createElement("tr");
      row.forEach((cell) => {
        const td = document.createElement("td");
        td.textContent = cell;
        tr.appendChild(td);
      });
      tableBody.appendChild(tr);
    });
  }

  data() {
    return { headers: this.headers, matrixData: this.matrixData };
  }
}

customElements.define("custom-table", CustomTable);
