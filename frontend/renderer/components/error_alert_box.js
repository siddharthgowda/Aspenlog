const errorAlertBoxStyle = `
        <style>
          .alert-box {
            display: none; /* Hidden by default */
            padding: 15px;
            margin: 10px 0;
            border-radius: 5px;
          }

          .error {
            border: 1px solid #f5c6cb;
            background-color: #f8d7da;
            color: #721c24;
          }

          .success {
          border: 1px solid #b8daff;
          background-color: #cce5ff;
          color: #004085;
          }

          .notification {
            border: 1px solid #ffeeba;
            background-color: #fff3cd;
            color: #856404;
          }
  
          .alert-box.visible {
            display: block; /* Show when visible class is added */
          }
        </style>
`;

const errorAlertBoxHTML = `
${errorAlertBoxStyle}
        <div class="alert-box error" id="alertBox">
          <span id="msg">An error occurred.</span>
        </div>
`;

const ERROR = "e";
const SUCCESS = "s";
const NOTIFICATION = "n";

class ErrorAlertBox extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    // Initial structure of the component
    this.shadowRoot.innerHTML = errorAlertBoxHTML;
  }

  /**
   * Displays the alert box with a given error message.
   * @param {string} msg - The message to display.
   * @param {string} type - The type of alert [error: "e", success: "s", notification: "n"]
   */
  alert(msg, type = ERROR) {
    const alertBox = this.shadowRoot.querySelector("#alertBox");
    const msgBox = this.shadowRoot.querySelector("#msg");

    msgBox.textContent = msg;

    alertBox.classList.add("visible");

    alertBox.classList.remove("error");
    alertBox.classList.remove("success");
    alertBox.classList.remove("notification");

    if (type == ERROR) {
      alertBox.classList.add("error");
    } else if (type == SUCCESS) {
      alertBox.classList.add("success");
    } else if (type == NOTIFICATION) {
      alertBox.classList.add(Notification);
    }
  }

  /**
   * Hides alert when no longer need for the application user
   */
  hide() {
    const alertBox = this.shadowRoot.querySelector("#alertBox");
    alertBox.classList.remove("visible");
  }
}

customElements.define("error-alert-box", ErrorAlertBox);
