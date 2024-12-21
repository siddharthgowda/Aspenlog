require("dotenv").config();

const getBackendUrl = () => {
  const isLocal = process.env.BACKEND_LOCAL === "true";
  return isLocal ? "http://localhost:42614" : "https://aspenlog.cc:42613";
};

module.exports = { getBackendUrl };
