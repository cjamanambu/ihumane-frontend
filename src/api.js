import axios from "axios";

const API = axios.create({
  baseURL: `https://irc-api.ihumane.net/`,
});

export default API;
