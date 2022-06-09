export default [
  {
    path: "/new-employee",
    name: "new-employee",
    meta: {
      authRequired: true,
    },
    component: () => import("@/views/pages/employees/new-employee"),
  },

  {
    path: "/employee-leave",
    name: "employee-leave",
    meta: {
      authRequired: true,
    },
    component: () => import("@/views/pages/leaves/leave"),
  },

  {
    path: "/manage-employees",
    name: "manage-employees",
    meta: {
      authRequired: true,
    },
    component: () => import("@/views/pages/employees/manage-employees"),
  },
  {
    path: "/manage-employees/:employeeID",
    name: "manage-employee",
    meta: {
      authRequired: true,
    },
    component: () => import("@/views/pages/employees/manage-employee"),
  },
  {
    path: "/manage-employees/edit-employee/:employeeID",
    name: "edit-employee-details",
    meta: {
      authRequired: true,
    },
    component: () => import("@/views/pages/employees/edit-employee-details"),
  },
  {
    path: "/manage-announcements",
    name: "manage-announcements",
    meta: {
      authRequired: true,
    },
    component: () => import("@/views/pages/communication/manage-announcement"),
  },
  {
    path: "/manage-queries",
    name: "manage-queries",
    meta: {
      authRequired: true,
    },
    component: () => import("@/views/pages/communication/manage-queries"),
  },
  {
    path: "/manage-queries-view/:queryId",
    name: "manage-queries-view",
    meta: {
      authRequired: true,
    },
    component: () => import("@/views/pages/communication/manage-queries-view"),
  },

  {
    path: "/supervisors",
    name: "supervisors",
    meta: {
      authRequired: true,
    },
    component: () => import("@/views/pages/employees/supervisors"),
  },

  {
    path: "/assign-supervisor",
    name: "assign-supervisor",
    meta: {
      authRequired: true,
    },
    component: () => import("@/views/pages/employees/assign-supervisor"),
  },

  {
    path: "/employee-documents/:employeeID",
    name: "employee-documents",
    meta: {
      authRequired: true,
    },
    component: () => import("@/views/pages/employees/manage-documents"),
  },
  {
    path: "/employee-education/:employeeID",
    name: "employee-education",
    meta: {
      authRequired: true,
    },
    component: () => import("@/views/pages/employees/employee-education"),
  },
  {
    path: "/employee-work-experience/:employeeID",
    name: "employee-work-experience",
    meta: {
      authRequired: true,
    },
    component: () => import("@/views/pages/employees/employee-work-experience"),
  },
];
