import axios from "axios";

export const API = axios.create({
  //baseURL: `https://irc-api.ihumane.net/`,
  baseURL: `http://localhost:9810/`,
  //baseURL: `https://api.ircng.org`,
});

export function SET_TOKEN(token) {
  API.defaults.headers.common["x-auth-token"] = token;
  localStorage.setItem("token", token);
}

export const AUTH_HEADER = () => {
  let token = localStorage.getItem("token");
  if (token) {
    return { "x-auth-token": token };
  }
};

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
  publicHolidays: `public-holidays`,
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
  salaryGrade: `salary-grade`,
  donor: `donor`,
  locationAllowance: `location-allowance`,
  rating: `rating`,
  goalSetting: `goal-setting`,
  endOfYear: `end-year-assessment`,
  grantChart: `grant-chart`,
  endYearRating: "end-year-rating",
  selfAssessment: "self-assessment",
  travelApplication: `travel-applications`,
  variationalPayment: `variational-payment`,
  salaryStructure: `salary-structure`,
  authorization: `application-authorization`,
  authorizationRole: `authorization-roles`,
  appAuthorization: `application-authorization`,
  timeSheetPenalty: `time-sheet-penalty`,
  leaveAccrual: `leave-accrual`,
  salary: `salary`,
  goalSettingYear: `goal-setting-year`,
  localGovernment: `local-government`,
  education: `education`,
  workExperience: `work-experience`,
  announcement: `announcements`,
  queries: `queries`,
  queryReply: `query-reply`,
  hrFocalPoint: `hr-focal-point`,
  leaveDoc: `leavedoc`,
};
