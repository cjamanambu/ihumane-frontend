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
];
