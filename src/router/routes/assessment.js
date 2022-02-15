export default [
  {
    path: "/self-assessment",
    name: "self-assessment",
    meta: {
      authRequired: true,
    },
    component: () => import("@/views/pages/assessment/self-assessment"),
  },
  {
    path: "/assess-employees",
    name: "assess-employees",
    meta: {
      authRequired: true,
    },
    component: () => import("@/views/pages/assessment/assess-employees"),
  },
  {
    path: "/assess-employee/:empid",
    name: "assess-employee",
    meta: {
      authRequired: true,
    },
    component: () => import("@/views/pages/assessment/assess-employee"),
  },
];
