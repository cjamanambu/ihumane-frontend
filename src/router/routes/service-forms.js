export default [
  {
    path: "/timesheets",
    name: "timesheets",
    meta: {
      authRequired: true,
    },
    component: () => import("@/views/pages/service-forms/timesheet/index"),
  },
  {
    path: "/timesheet",
    name: "timesheet",
    meta: {
      authRequired: true,
    },
    component: () => import("@/views/pages/service-forms/timesheet/timesheet"),
  },
  {
    path: "/timesheets/:payrollMY",
    name: "view-timesheet",
    meta: {
      authRequired: true,
    },
    component: () =>
      import("@/views/pages/service-forms/timesheet/view-timesheet"),
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
    path: "/manage-time-sheets",
    name: "manage-time-sheets",
    meta: {
      authRequired: true,
    },
    component: () => import("@/views/pages/self-service/time-sheet"),
  },
  {
    path: "/manage-time-sheet-details/:month/:year",
    name: "manage-time-sheet-details",
    meta: {
      authRequired: true,
    },
    component: () => import("@/views/pages/self-service/time-sheet-details"),
  },

  {
    path: "/travel-request",
    name: "new-travel-request",
    meta: {
      authRequired: true,
    },
    component: () =>
      import("@/views/pages/service-forms/travel-request/new-travel-request"),
  },
  {
    path: "/travel-requests",
    name: "travel-requests",
    meta: {
      authRequired: true,
    },
    component: () => import("@/views/pages/service-forms/travel-request/index"),
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
  {
    path: "/leave-application",
    name: "leave-application",
    meta: {
      authRequired: true,
    },
    component: () => import("@/views/pages/service-forms/leave-application"),
  },

];
