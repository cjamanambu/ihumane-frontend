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
    path: "/reports/emolument/:period/:locationID",
    name: "emolument-report",
    meta: {
      authRequired: true,
    },
    component: () => import("@/views/pages/reports/emolument-report"),
  },
  {
    path: "/reports/deduction-sheet/:period",
    name: "deduction-sheet",
    meta: {
      authRequired: true,
    },
    component: () => import("@/views/pages/reports/deduction-sheet"),
  },
  {
    path: "/reports/deduction-report/:period/:pdID",
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
  {
    path: "/reports/bank-schedule/:period/:locationID",
    name: "bank-schedule-report",
    meta: {
      authRequired: true,
    },
    component: () => import("@/views/pages/reports/bank-report"),
  },
  {
    path: "/reports/employee-report/:type",
    name: "employee-report",
    meta: {
      authRequired: true,
    },
    component: () => import("@/views/pages/reports/employee-report"),
  },
  {
    path: "/reports/pension-report/:period/:locationID",
    name: "pension-report",
    meta: {
      authRequired: true,
    },
    component: () => import("@/views/pages/reports/pension-report"),
  },

  {
    path: "/reports/nhf-report/:period/:locationID",
    name: "nhf-report",
    meta: {
      authRequired: true,
    },
    component: () => import("@/views/pages/reports/nhf-report"),
  },

  {
    path: "/reports/tax-report/:period/:locationID",
    name: "tax-report",
    meta: {
      authRequired: true,
    },
    component: () => import("@/views/pages/reports/tax-report"),
  },

  {
    path: "/reports/nsitf-report/:period/:locationID",
    name: "nsitf-report",
    meta: {
      authRequired: true,
    },
    component: () => import("@/views/pages/reports/nsitf-report"),
  },
  {
    path: "/reports/approved-salary-routine/:period",
    name: "approved-salary-routine",
    meta: {
      authRequired: true,
    },
    component: () => import("@/views/pages/reports/approved-salary-routine"),
  },

  {
    path: "/view-approved-salary-routine/:locationId",
    name: "view-approved-salary-routine",
    meta: {
      authRequired: true,
    },
    component: () => import("@/views/pages/reports/view-approved-salary-routine"),
  },
];
