export default [
  {
    path: "/profile",
    name: "profile",
    meta: {
      authRequired: true,
    },
    component: () => import("@/views/pages/self-service/profile"),
  },
  {
    path: "/payslip",
    name: "payslip",
    meta: {
      authRequired: true,
    },
    component: () => import("@/views/pages/self-service/payslip"),
  },
  {
    path: "/change-password",
    name: "change-password",
    meta: {
      authRequired: true,
    },
    component: () => import("@/views/pages/self-service/change-password"),
  },
  {
    path: "/leave-applications",
    name: "leave-applications",
    meta: {
      authRequired: true,
    },
    component: () =>
      import("@/views/pages/self-service/leave-management/leave-application"),
  },
  {
    path: "/leave-application-details/:leaveAppID",
    name: "leave-application-details",
    meta: {
      authRequired: true,
    },
    component: () =>
      import(
        "@/views/pages/self-service/leave-management/leave-application-details"
      ),
  },
  {
    path: "/manage-leave-applications",
    name: "manage-leave-applications",
    meta: {
      authRequired: true,
    },
    component: () =>
      import(
        "@/views/pages/self-service/leave-management/manage-leave-applications"
      ),
  },
  {
    path: "/manage-leave-application/:leaveAppID",
    name: "manage-leave-application",
    meta: {
      authRequired: true,
    },
    component: () =>
      import(
        "@/views/pages/self-service/leave-management/manage-leave-application"
      ),
  },
  {
    path: "/employee-leave-accruals",
    name: "employee-leave-accruals",
    meta: {
      authRequired: true,
    },
    component: () =>
      import("@/views/pages/self-service/employee-leave-accruals"),
  },
];
