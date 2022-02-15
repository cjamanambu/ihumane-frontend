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

  {
    path: "/confirm-variation",
    name: "confirm-variation",
    meta: {
      authRequired: true,
    },
    component: () =>
        import("@/views/pages/variation/confirm-variation"),
  },

  {
    path: "/current-variation",
    name: "current-variation",
    meta: {
      authRequired: true,
    },
    component: () =>
        import("@/views/pages/variation/current-variation"),
  },

];
