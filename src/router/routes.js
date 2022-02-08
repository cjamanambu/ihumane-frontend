import auth from "./routes/auth";
import payrollConfiguration from "./routes/payroll-configuration";
import hrConfiguration from "./routes/hr-configuration";
import authorizations from "./routes/authorizations";
import employeeManagement from "./routes/employee-management"
import misc from "./routes/misc"
import serviceForms from "./routes/service-forms"
import selfService from "./routes/self-service"
import variation from "@/router/routes/variation";

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
  ...variation
];
