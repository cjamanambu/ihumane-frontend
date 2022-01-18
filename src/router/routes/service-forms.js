export default [
  {
    path: "/timesheet",
    name: "timesheet",
    meta: {
      authRequired: true,
    },
    component: () => import("@/views/pages/service-forms/timesheet"),
  },
  {
    path: "/timesheet-entry/:date",
    name: "timesheet-entry",
    meta: {
      authRequired: true,
    },
    component: () => import("@/views/pages/service-forms/timesheet-entry"),
  },
];
