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
    path: "/self-assessment/mid-year-checking",
    name: "mid-year-checking",
    meta: {
      authRequired: true,
    },
    component: () =>
      import("@/views/pages/assessment/self-assessment/mid-year-checking"),
  },
  {
    path: "/self-assessment/end-of-year",
    name: "end-of-year-assessment",
    meta: {
      authRequired: true,
    },
    component: () =>
      import("@/views/pages/assessment/self-assessment/end-of-year"),
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
  {
    path: "/assessment-details/:empid",
    name: "assessment-details",
    meta: {
      authRequired: true,
    },
    component: () =>
      import("@/views/pages/assessment/self-assessment/assessment-detail"),
  },
];
