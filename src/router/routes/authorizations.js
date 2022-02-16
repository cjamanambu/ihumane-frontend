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
    component: () => import("@/views/pages/self-service/leave-application"),
  },
  {
    path: "/leave-application-details/:id",
    name: "leave-application-details",
    meta: {
      authRequired: true,
    },
    component: () => import("@/views/pages/self-service/leave-application-details"),
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
    path: "/travel-application-details/:id",
    name: "travel-application-details",
    meta: {
      authRequired: true,
    },
    component: () => import("@/views/pages/self-service/travel-application-details"),
  },

];
