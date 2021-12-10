import axios from "axios";

export const API = axios.create({
  baseURL: `https://irc-api.ihumane.net/`,
});
