export default [
  {
    path: "/users",
    name: "users",
    meta: {
      authRequired: true,
    },
    component: () => import("@/views/pages/users/index"),
  },
];
