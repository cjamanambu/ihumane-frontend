export default [
  {
    path: "/profile",
    name: "profile",
    meta: {
      authRequired: true,
    },
    component: () => import("@/views/pages/self-service/profile"),
  },
  {
    path: "/payslip",
    name: "payslip",
    meta: {
      authRequired: true,
    },
    component: () => import("@/views/pages/self-service/payslip"),
  },
  {
    path: "/change-password",
    name: "change-password",
    meta: {
      authRequired: true,
    },
    component: () => import("@/views/pages/self-service/change-password"),
  },
];
