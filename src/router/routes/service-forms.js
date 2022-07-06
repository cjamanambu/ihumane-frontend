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
    path: "/select-timesheet-period",
    name: "select-timesheet-period",
    meta: {
      authRequired: true,
    },
    component: () =>
      import("@/views/pages/service-forms/timesheet/timesheet-index"),
  },
  {
    path: "/timesheet/:payrollMY",
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
  /*{
    path: "/travel-requests/:travelAppID",
    name: "travel-request",
    meta: {
      authRequired: true,
    },
    component: () =>
      import("@/views/pages/service-forms/travel-request/travel-request"),
  },*/
  {
    path: "/travel-requests/:travelAppID",
    name: "travel-application-details",
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
    component: () =>
      import("@/views/pages/service-forms/leave-application/index"),
  },
  {
    path: "/new-leave-application",
    name: "new-leave-application",
    meta: {
      authRequired: true,
    },
    component: () =>
      import(
        "@/views/pages/service-forms/leave-application/new-leave-application"
      ),
  },
  {
    path: "/view-leave-application/:leaveApplicationID",
    name: "view-leave-application",
    meta: {
      authRequired: true,
    },
    component: () =>
      import("@/views/pages/service-forms/leave-application/leave-application"),
  },
  {
    path: "/view-announcements",
    name: "view-announcements",
    meta: {
      authRequired: true,
    },
    component: () => import("@/views/pages/self-service/announcement"),
  },
  {
    path: "/view-queries",
    name: "view-queries",
    meta: {
      authRequired: true,
    },
    component: () => import("@/views/pages/self-service/query"),
  },
  {
    path: "/view-queries/:qId",
    name: "read-query",
    meta: {
      authRequired: true,
    },
    component: () => import("@/views/pages/self-service/query-view"),
  },
  {
    path: "/travel-application-detail/:id",
    name: "travel-application-detail",
    meta: {
      authRequired: true,
    },
    component: () =>
      import("@/views/pages/self-service/travel-application-details"),
  },
];
