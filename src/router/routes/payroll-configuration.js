export default [
  {
    path: "/payment-definitions",
    name: "payment-definitions",
    meta: {
      authRequired: true,
    },
    component: () =>
      import("@/views/pages/payroll-configuration/payment-definitions"),
  },
  {
    path: "/tax-rates",
    name: "tax-rates",
    meta: {
      authRequired: true,
    },
    component: () => import("@/views/pages/payroll-configuration/tax-rates"),
  },
]