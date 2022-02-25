export default [
  {
    path: "/reports",
    name: "reports",
    meta: {
      authRequired: true,
    },
    component: () => import("@/views/pages/reports/index.vue"),
  },
  {
    path: "/reports/emolument/:period",
    name: "emolument-report",
    meta: {
      authRequired: true,
    },
    component: () => import("@/views/pages/reports/emolument-report"),
  },
  {
    path: "/reports/deduction/:period",
    name: "deduction-report",
    meta: {
      authRequired: true,
    },
    component: () => import("@/views/pages/reports/deduction-report"),
  },
  {
    path: "/reports/variation/:period",
    name: "variation-report",
    meta: {
      authRequired: true,
    },
    component: () => import("@/views/pages/reports/variation-report"),
  },
];
