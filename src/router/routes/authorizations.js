export default [
  {
    path: "/travel-authorization",
    name: "travel-authorization",
    meta: {
      authRequired: true,
    },
    component: () =>
      import("@/views/pages/authorizations/travel-authorization/index"),
  },
  {
    path: "/travel-authorization/:travelAppID",
    name: "view-travel-authorization",
    meta: {
      authRequired: true,
    },
    component: () =>
      import(
        "@/views/pages/authorizations/travel-authorization/view-travel-authorization"
      ),
  },
];
