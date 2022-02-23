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
];
