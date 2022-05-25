import auth from "./routes/auth";
import payrollConfiguration from "./routes/payroll-configuration";
import hrConfiguration from "./routes/hr-configuration";
import authorizations from "./routes/authorizations";
import employeeManagement from "./routes/employee-management";
import misc from "./routes/misc";
import serviceForms from "./routes/service-forms";
import selfService from "./routes/self-service";
import variation from "@/router/routes/variation";
import assessment from "./routes/assessment";
import payrollRoutine from "./routes/payroll-routine";
import payrollJournal from "./routes/payroll-journal"
import report from "./routes/report";

export default [
  {
    path: "/",
    name: "home",
    meta: {
      authRequired: true,
    },
    component: () => import("@/views/pages/dashboard/index"),
  },
  ...auth,
  ...payrollConfiguration,
  ...hrConfiguration,
  ...employeeManagement,
  ...serviceForms,
  ...selfService,
  ...authorizations,
  ...misc,
  ...variation,
  ...assessment,
  ...payrollRoutine,
  ...report,
  ...payrollJournal
];
