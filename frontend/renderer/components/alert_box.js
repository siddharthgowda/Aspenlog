/**
 alertbox.js

This file contains the reusable alert component. It comes in three styles, error to display user errors, success to display
successful requests, and notification for basic information, like loading states.

Please refer to the LICENSE and DISCLAIMER files for more information regarding the use and distribution of this code.
By using this code, you agree to abide by the terms and conditions in those files.

Author: Siddharth Gowda [https://github.com/siddharthgowda]
 **/

const alertBoxStyle = `
        <style>
          .alert-box {
            padding: 15px;
            margin: 10px 0;
            border-radius: 5px;
          }

          .error {
            border: 1px solid #f5c6cb;
            background-color: #f8d7da;
            color: #721c24;
          }

          .notification {
          border: 1px solid #b8daff;
          background-color: #cce5ff;
          color: #004085;
          }

          .success {
            border: 1px solid #c3e6cb;
            background-color: #d4edda;
            color: #155724;
          }
  
          .alert-box.visible {
            display: block; /* Show when visible class is added */
          }
          
          .alert-box.hide {
              display: none; /* Hidden by default */
            }
        </style>
`;

const alertBoxHTML = `
${alertBoxStyle}
        <div class="alert-box" id="alert-box-container">
          <span id="msg">An error occurred.</span>
        </div>
`;

const ERROR = "ERROR";
const SUCCESS = "SUCCESS";
const NOTIFICATION = "NOTIFICATION";

class AlertBox extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    // Initial structure of the component
    this.shadowRoot.innerHTML = alertBoxHTML;
  }

  connectedCallback() {
    const alertBox = this.shadowRoot.querySelector("#alert-box-container");
    alertBox.classList.remove("visible");
    alertBox.classList.remove("error");
    alertBox.classList.remove("success");
    alertBox.classList.remove("notification");
    alertBox.classList.add("hide");
  }

  /**
   * Displays the alert box with a given error message.
   * @param {string} msg - The message to display.
   * @param {string} type - The type of alert: [ERROR, SUCCESS, NOTIFICATION]. Default is ERROR.
   */
  alert(msg, type = ERROR) {
    const alertBox = this.shadowRoot.querySelector("#alert-box-container");
    const msgBox = this.shadowRoot.querySelector("#msg");

    msgBox.textContent = msg;

    alertBox.classList.remove("hide");
    alertBox.classList.add("visible");

    alertBox.classList.remove("error");
    alertBox.classList.remove("success");
    alertBox.classList.remove("notification");
    if (type == ERROR) {
      console.log(ERROR);
      alertBox.classList.add("error");
    } else if (type == SUCCESS) {
      console.log(SUCCESS);
      alertBox.classList.add("success");
    } else if (type == NOTIFICATION) {
      console.log(NOTIFICATION);
      alertBox.classList.add("notification");
    }
  }

  /**
   * Hides alert when no longer need for the application user
   */
  hide() {
    // setting timeout so alert is not removed too fast
    // to make sure it is not garing on the eye
    setTimeout(() => {
      const alertBox = this.shadowRoot.querySelector("#alert-box-container");
      alertBox.classList.remove("visible");
      alertBox.classList.add("hide");
    }, 100);
  }
}

customElements.define("alert-box", AlertBox);
