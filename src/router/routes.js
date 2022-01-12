import auth from "./routes/auth"
import payrollConfiguration from "./routes/payroll-configuration";
import hrConfiguration from "./routes/hr-configuration";
import employeeManagement from "./routes/employee-management"
import misc from "./routes/misc"
import serviceForms from "./routes/service-forms"

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
  ...misc,
];
