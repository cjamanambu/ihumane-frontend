export default [
  {
    path: "/travel-authorization",
    name: "travel-authorization",
    meta: {
      authRequired: true,
    },
    component: () =>
      import("@/views/pages/authorizations/travel-authorization/index"),
  },
  {
    path: "/travel-authorization/:travelAppID",
    name: "view-travel-authorization",
    meta: {
      authRequired: true,
    },
    component: () =>
      import(
        "@/views/pages/authorizations/travel-authorization/view-travel-authorization"
      ),
  },
  {
    path: "/time-sheet-authorization",
    name: "time-sheet-authorization",
    meta: {
      authRequired: true,
    },
    component: () =>
        import("@/views/pages/authorizations/timesheet/index"),
  },
  {
    path: "/view-time-sheet-authorization/:month/:year/:empId",
    name: "view-time-sheet-authorization",
    meta: {
      authRequired: true,
    },
    component: () =>
        import(
            "@/views/pages/authorizations/timesheet/view-time-sheet"
            ),
  },
];
