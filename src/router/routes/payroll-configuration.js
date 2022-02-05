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
  {
    path: "/payroll-setup",
    name: "payroll-setup",
    meta: {
      authRequired: true,
    },
    component: () =>
      import("@/views/pages/payroll-configuration/payroll-setup"),
  },
  {
    path: "/salary-grades",
    name: "salary-grades",
    meta: {
      authRequired: true,
    },
    component: () =>
      import("@/views/pages/payroll-configuration/salary-grades"),
  },
  {
    path: "/donors",
    name: "donors",
    meta: {
      authRequired: true,
    },
    component: () => import("@/views/pages/payroll-configuration/donors"),
  },
  {
    path: "/location-allowances",
    name: "location-allowances",
    meta: {
      authRequired: true,
    },
    component: () =>
      import("@/views/pages/payroll-configuration/location-allowances"),
  },
  {
    path: "/grant-charts",
    name: "grant-charts",
    meta: {
      authRequired: true,
    },
    component: () => import("@/views/pages/payroll-configuration/grant-charts"),
  },
  {
    path: "/salary-structures",
    name: "salary-structures",
    meta: {
      authRequired: true,
    },
    component: () =>
      import("@/views/pages/payroll-configuration/salary-structures"),
  },
];
