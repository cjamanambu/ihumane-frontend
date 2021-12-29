import axios from "axios";

export const API = axios.create({
  // baseURL: `https://irc-api.ihumane.net/`,
  baseURL: `http://localhost:9000/`,
});

export function SET_TOKEN(token) {
  API.defaults.headers.common["x-auth-token"] = token;
  localStorage.setItem("token", token);
}

export const ROUTES = {
  department: `departments`,
  grade: `grades`,
  jobRole: `job-roles`,
  paymentDefinition: `payment-definitions`,
  state: `states`,
  minimumTaxRate: `minimum-tax-rate`,
  taxRate: `tax-rates`,
  user: `users`,
  location: `locations`,
  bank: `banks`,
  employee: `employees`,
  leaveType:`leave-types`,
  leaveApplication: `leave-application`,
};
