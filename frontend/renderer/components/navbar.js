const componentStyle = `
  <style>
  :host {
      display: block;
    }
    nav {
      background-color: #efece7;
      padding: 0 30px;
      border-bottom: 5px solid #ccac81;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .logo {
      font-weight: bold;
      font-size: 1.2em;
    }
    .dropdown {
      position: relative;
      display: inline-block;
    }
    .dropdown-menu {
      display: none;
      position: absolute;
      right: 0;
      background-color: #efece7;
      min-width: 160px;
      box-shadow: 0 8px 16px rgba(0,0,0,0.2);
      z-index: 1;
    }
    .dropdown:hover .dropdown-menu {
      display: block;
    }
    a {
      color: #61523d;
      font-weight: bold;
      text-decoration: none;
      display: block;
      padding: 12px 16px;
    }
    a:hover {
      color: #9d661b;
      background-color: #f7f4ef;
    }
    #navbarDropdownMenuLink {
      cursor: pointer;
      padding: 15px 0;
    }

  </style>
`;

const componentHTML = `
${componentStyle}
<nav class="navbar navbar-expand-lg navbar-light bg-light" id="navbar">
      <img
        src="../assets/images/logo%20(Large).png"
        style="width: 75px; height: 75px"
      />

      <div
        class="collapse navbar-collapse justify-content-end"
        id="navbarNavDropdown"
      >
        <ul class="navbar-nav">
          <li class="nav-item dropdown">
            <a
              aria-expanded="false"
              aria-haspopup="true"
              class="nav-link dropdown-toggle"
              data-bs-toggle="dropdown"
              href="#"
              id="navbarDropdownMenuLink"
              role="button"
            >
              Username
            </a>
            <div aria-labelledby="navbarDropdownMenuLink" class="dropdown-menu">
              <a class="dropdown-item" href="#" id="profile">Profile</a>
              <a class="dropdown-item" href="#" id="logout">Logout</a>
            </div>
          </li>
        </ul>
      </div>
    </nav>
`;

class CustomNavbar extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = componentHTML;
  }

  connectedCallback() {
    this.setUsernameDropdown();
    this.shadowRoot.querySelector("#profile").addEventListener("click", () => {
      window.location.href = "profile.html";
    });
    this.shadowRoot.querySelector("#logout").addEventListener("click", () => {
      window.api.invoke("store-token", "");
      window.location.href = "login.html";
    });
  }

  // Setters
  setUsernameDropdown() {
    window.api.invoke("get-connection-address").then((connectionAddress) => {
      window.api.invoke("get-token").then((token) => {
        const myHeaders = new Headers();
        myHeaders.append("Accept", "application/json");
        myHeaders.append("Authorization", `Bearer ${token}`);
        const requestOptions = {
          method: "POST",
          headers: myHeaders,
          redirect: "follow",
        };
        fetch(`${connectionAddress}/get_user_profile`, requestOptions)
          .then((response) => response.json())
          .then((result) => {
            let data = JSON.parse(result);
            const username = data["username"];
            this.shadowRoot.querySelector(
              "#navbarDropdownMenuLink"
            ).textContent = username;
          })
          .catch((error) => {
            console.log(error);
            window.location.href = "login.html";
          });
      });
    });
  }
}

customElements.define("custom-navbar", CustomNavbar);
