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
];