export default [
  {
    path: "/journal-code",
    name: "journal-code",
    meta: {
      authRequired: true,
    },
    component: () => import("@/views/pages/payroll-journal/journal-code"),
  },
  {
    path: "/salary-mappings",
    name: "salary-mappings",
    meta: {
      authRequired: true,
    },
    component: () => import("@/views/pages/payroll-journal/salary-mappings"),
  },
];
