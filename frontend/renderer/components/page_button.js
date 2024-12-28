/**
 page_button.js
 This is a reusable button that takes in the name of an html page and switches to it on click.

Please refer to the LICENSE and DISCLAIMER files for more information regarding the use and distribution of this code.
By using this code, you agree to abide by the terms and conditions in those files.

Author: Siddharth Gowda [https://github.com/siddharthgowda]
 **/

const componentStylePageButton = `
  <style>
    .page-button {
      width: 20%; 
      margin: 0 auto;
      border: transparent;
      background-color: #9bca6d; 
      border-radius: 12px; 
      font-weight: bold; 
      color: white; 
      padding: 10px 20px; 
      text-align: center; 
      cursor: pointer;
    }

    .page-button:hover {
      background-color: #85b05a; 
    }

    .page-button:focus {
      outline: none; 
      background-color: #85b05a; 
    }
  </style>
`;

const componentHTMLPageButton = `
  ${componentStylePageButton}
  <button class="page-button"><slot></slot></button>
`;

class PageButton extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = componentHTMLPageButton;
  }

  static get observedAttributes() {
    return ["page"];
  }

  connectedCallback() {
    this.shadowRoot
      .querySelector(".page-button")
      .addEventListener("click", () => {
        const page = this.getAttribute("page");
        window.location.href = `${page}.html`;
      });
  }
}

customElements.define("page-button", PageButton);
