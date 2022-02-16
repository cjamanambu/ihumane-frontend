export default [
  {
    path: "/self-assessment",
    name: "self-assessment",
    meta: {
      authRequired: true,
    },
    component: () => import("@/views/pages/assessment/self-assessment/index"),
  },
  {
    path: "/self-assessment/beginning-of-year",
    name: "beginning-of-year",
    meta: {
      authRequired: true,
    },
    component: () =>
      import("@/views/pages/assessment/self-assessment/beginning-of-year"),
  },
  {
    path: "/assess-employees",
    name: "assess-employees",
    meta: {
      authRequired: true,
    },
    component: () => import("@/views/pages/assessment/assess-employees/index"),
  },
  {
    path: "/assess-employee/:empid",
    name: "assess-employee",
    meta: {
      authRequired: true,
    },
    component: () =>
      import("@/views/pages/assessment/assess-employees/assess-employee"),
  },
];
