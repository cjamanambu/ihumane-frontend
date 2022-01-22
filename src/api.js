import axios from "axios";

export const API = axios.create({
  baseURL: `https://irc-api.ihumane.net/`,
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
  publicHolidays:`public-holidays`,
  bank: `banks`,
  employee: `employees`,
  leaveType: `leave-types`,
  leaveApplication: `leave-application`,
  pensionProvider: `pension-providers`,
  hmo: `hmos`,
  qualification: `qualifications`,
  subsidiary: `subsidiaries`,
  supervisorAssignment: `supervisor-assignment`,
  timesheet: `time-sheet`,
  timeAllocation: `time-allocation`,
  payrollMonthYear: `payroll-month-year`,
};
