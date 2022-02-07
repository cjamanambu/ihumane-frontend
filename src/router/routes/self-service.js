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
    path: "/leave-application",
    name: "leave-application",
    meta: {
      authRequired: true,
    },
    component: () => import("@/views/pages/self-service/leave-application"),
  },
];
