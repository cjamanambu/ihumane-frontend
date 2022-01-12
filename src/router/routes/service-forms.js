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
    path: "/time-effort-reporting/:date",
    name: "time-effort-reporting",
    meta: {
      authRequired: true,
    },
    component: () =>
      import("@/views/pages/service-forms/time-effort-reporting"),
  },
];
