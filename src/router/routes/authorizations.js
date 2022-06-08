export default [
  {
    path: "/travel-authorization",
    name: "travel-authorization",
    meta: {
      authRequired: true,
    },
    component: () => import("@/views/pages/authorizations/travel/index"),
  },
  {
    path: "/travel-authorization/:travelAppID",
    name: "view-travel-authorization",
    meta: {
      authRequired: true,
    },
    component: () =>
      import("@/views/pages/authorizations/travel/view-travel-authorization"),
  },
  {
    path: "/leave-authorization",
    name: "leave-authorization",
    meta: {
      authRequired: true,
    },
    component: () => import("@/views/pages/authorizations/leave/index"),
  },
  {
    path: "/leave-authorization/:leaveAppID",
    name: "view-leave-authorization",
    meta: {
      authRequired: true,
    },
    component: () =>
      import("@/views/pages/authorizations/leave/leave-authorization"),
  },
  {
    path: "/time-sheet-authorization",
    name: "time-sheet-authorization",
    meta: {
      authRequired: true,
    },
    component: () => import("@/views/pages/authorizations/timesheet/index"),
  },
  {
    path: "/view-time-sheet-authorization/:month/:year/:empId",
    name: "view-time-sheet-authorization",
    meta: {
      authRequired: true,
    },
    component: () =>
      import("@/views/pages/authorizations/timesheet/view-time-sheet"),
  },
  {
    path: "/manage-leave-applications",
    name: "manage-leave-applications",
    meta: {
      authRequired: true,
    },
    component: () =>
      import("@/views/pages/self-service/leave-management/leave-application"),
  },
  {
    path: "/manage-travel-applications",
    name: "manage-travel-applications",
    meta: {
      authRequired: true,
    },
    component: () => import("@/views/pages/self-service/travel-applications"),
  },
  {
    path: "/travel-application-details/:travelAppID",
    name: "travel-application-details",
    meta: {
      authRequired: true,
    },
    component: () =>
      import("@/views/pages/self-service/travel-application-details"),
  },
  {
    path: "/manage-time-sheet-details/:month/:year/:empId",
    name: "manage-time-sheet-details",
    meta: {
      authRequired: true,
    },
    component: () => import("@/views/pages/self-service/time-sheet-details"),
  },
];
