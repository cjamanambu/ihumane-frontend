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
    component: () =>
        import("@/views/pages/service-forms/self-assessment"),
  },
  {
    path: "/assess-employee",
    name: "assess-employee",
    meta: {
      authRequired: true,
    },
    component: () =>
        import("@/views/pages/service-forms/assess-employee"),
  },
  {
    path: "/employee-assessment/:empid",
    name: "employee-assessment",
    meta: {
      authRequired: true,
    },
    component: () =>
        import("@/views/pages/service-forms/employee-assessment"),    
  },
  {
    path: "/travel-authorization",
    name: "travel-authorization",
    meta: {
      authRequired: true,
    },
    component: () => import("@/views/pages/service-forms/travel-authorization/index"),
  }
];
