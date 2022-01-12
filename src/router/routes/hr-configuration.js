export default [
  {
    path: "/banks",
    name: "banks",
    meta: {
      authRequired: true,
    },
    component: () => import("@/views/pages/hr-configuration/banks"),
  },
  {
    path: "/pension-providers",
    name: "pension-providers",
    meta: {
      authRequired: true,
    },
    component: () =>
      import("@/views/pages/hr-configuration/pension-providers"),
  },
  {
    path: "/hmos",
    name: "hmos",
    meta: {
      authRequired: true,
    },
    component: () => import("@/views/pages/hr-configuration/hmos"),
  },
  {
    path: "/departments",
    name: "departments",
    meta: {
      authRequired: true,
    },
    component: () => import("@/views/pages/hr-configuration/departments"),
  },
  {
    path: "/grades",
    name: "grades",
    meta: {
      authRequired: true,
    },
    component: () => import("@/views/pages/hr-configuration/grades"),
  },
  {
    path: "/job-roles",
    name: "job-roles",
    meta: {
      authRequired: true,
    },
    component: () => import("@/views/pages/hr-configuration/job-roles"),
  },
  {
    path: "/states",
    name: "states",
    meta: {
      authRequired: true,
    },
    component: () => import("@/views/pages/hr-configuration/states"),
  },
  {
    path: "/locations",
    name: "locations",
    meta: {
      authRequired: true,
    },
    component: () => import("@/views/pages/hr-configuration/locations"),
  },
  {
    path: "/qualifications",
    name: "qualifications",
    meta: {
      authRequired: true,
    },
    component: () => import("@/views/pages/hr-configuration/qualifications"),
  },
  {
    path: "/subsidiaries",
    name: "subsidiaries",
    meta: {
      authRequired: true,
    },
    component: () => import("@/views/pages/hr-configuration/subsidiaries"),
  },
  {
    path: "/leave-types",
    name: "leave-types",
    meta: {
      authRequired: true,
    },
    component: () => import("@/views/pages/hr-configuration/leave-types"),
  },
]