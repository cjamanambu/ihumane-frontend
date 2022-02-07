export default [
  {
    path: "/timesheet",
    name: "timesheet",
    meta: {
      authRequired: true,
    },
    component: () => import("@/views/pages/service-forms/timesheet/index"),
  },
  {
    path: "/timesheet-entry/:date",
    name: "timesheet-entry",
    meta: {
      authRequired: true,
    },
    component: () =>
      import("@/views/pages/service-forms/timesheet/timesheet-entry"),
  },
  {
    path: "/self-assessment",
    name: "self-assessment",
    meta: {
      authRequired: true,
    },
    component: () => import("@/views/pages/service-forms/self-assessment"),
  },
  {
    path: "/assess-employee",
    name: "assess-employee",
    meta: {
      authRequired: true,
    },
    component: () => import("@/views/pages/service-forms/assess-employee"),
  },
  {
    path: "/employee-assessment/:empid",
    name: "employee-assessment",
    meta: {
      authRequired: true,
    },
    component: () => import("@/views/pages/service-forms/employee-assessment"),
  },
  {
    path: "/travel-request",
    name: "new-travel-request",
    meta: {
      authRequired: true,
    },
    component: () => import("@/views/pages/service-forms/travel-request/index"),
  },
  {
    path: "/travel-requests",
    name: "travel-requests",
    meta: {
      authRequired: true,
    },
    component: () =>
      import("@/views/pages/service-forms/travel-request/travel-requests"),
  },
  {
    path: "/travel-requests/:travelAppID",
    name: "travel-request",
    meta: {
      authRequired: true,
    },
    component: () =>
      import("@/views/pages/service-forms/travel-request/travel-request"),
  },
];
