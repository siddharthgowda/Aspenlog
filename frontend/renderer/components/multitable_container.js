/**
multitable_container.js
This file is the code for a container of multiple tables. You can create, modifty and render table data
for all tables in the container.

Please refer to the LICENSE and DISCLAIMER files for more information regarding the use and distribution of this code.
By using this code, you agree to abide by the terms and conditions in those files.

Author: Siddharth Gowda [https://github.com/siddharthgowda]
 **/

class MultiTableContainer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = `<div id="table-container"></div>`;
    this.tables = [];
  }

  /**
   * Sets the number of tables in the container.
   * @param {number} n - The number of tables to create.
   */
  numTables(n) {
    const container = this.shadowRoot.getElementById("table-container");
    container.innerHTML = ""; // Clear existing tables
    this.tables = [];

    for (let i = 0; i < n; i++) {
      const tableWrapper = document.createElement("div");
      tableWrapper.style.marginBottom = "20px";

      const customTable = document.createElement("custom-table");
      tableWrapper.appendChild(customTable);
      container.appendChild(tableWrapper);

      this.tables.push(customTable);
    }
  }

  /**
   * Renders a specific table with headers and matrix data.
   * @param {number} index - The index of the table to update.
   * @param {Array<string>} headers - Column headers for the table.
   * @param {Array<Array<any>>} matrixData - Data for the table.
   */
  renderTable(index, headers, matrixData) {
    if (index < 0 || index >= this.tables.length) {
      console.error("Invalid table index.");
      return;
    }
    this.tables[index].render(headers, matrixData);
  }
}

customElements.define("multi-table-container", MultiTableContainer);
