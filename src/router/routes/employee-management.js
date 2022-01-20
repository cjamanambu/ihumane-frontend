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
]