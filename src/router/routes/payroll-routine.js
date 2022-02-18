export default [
  {
    path: "/process-payroll",
    name: "process-payroll",
    meta: {
      authRequired: true,
    },
    component: () => import("@/views/pages/payroll-routine/process-payroll"),
  },
];
