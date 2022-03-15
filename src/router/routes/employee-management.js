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
    path: "/manage-leave-applications",
    name: "manage-leave-application",
    meta: {
      authRequired: true,
    },
    component: () => import("@/views/pages/self-service/leave-application"),
  },
  {
    path: "/employee-documents/:employeeID",
    name: "employee-documents",
    meta: {
      authRequired: true,
    },
    component: () => import("@/views/pages/employees/manage-documents"),
  },
];
