export default [
  {
    path: "/process-payroll",
    name: "process-payroll",
    meta: {
      authRequired: true,
    },
    component: () => import("@/views/pages/payroll-routine/process-payroll"),
  },

  {
    path: "/approve-payroll",
    name: "approve-payroll",
    meta: {
      authRequired: true,
    },
    component: () => import("@/views/pages/payroll-routine/approve-payroll"),
  },
  {
    path: "/view-payslip/:empID/:month/:year",
    name: "view-payslip",
    meta: {
      authRequired: true,
    },
    component: () => import("@/views/pages/payroll-routine/view-payslip"),
  },

  {
    path: "/emolument-location/:locationId",
    name: "emolument-location",
    meta: {
      authRequired: true,
    },
    component: () => import("@/views/pages/payroll-routine/emolument-location"),
  },

  {
    path: "/approve-emolument-location/:locationId",
    name: "approve-emolument-location",
    meta: {
      authRequired: true,
    },
    component: () => import("@/views/pages/payroll-routine/approve-emolument-location"),
  },
];
