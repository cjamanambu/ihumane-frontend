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
    path: "/salary-mapping",
    name: "salary-mapping",
    meta: {
      authRequired: true,
    },
    component: () => import("@/views/pages/payroll-journal/salary-mapping"),
  },
];
