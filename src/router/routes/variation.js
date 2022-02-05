export default [
  {
    path: "/new-variation",
    name: "new-variation",
    meta: {
      authRequired: true,
    },
    component: () =>
      import("@/views/pages/variation/new-variation"),
  },

];
