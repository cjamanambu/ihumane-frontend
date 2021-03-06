import store from "@/state/store";

export default [
  {
    path: "/login",
    name: "login",
    component: () => import("@/views/pages/account/login"),
    meta: {
      beforeResolve(routeTo, routeFrom, next) {
        // If the user is already logged in
        if (store.getters["auth/loggedIn"]) {
          // Redirect to the home page instead
          next({ name: "home" });
        } else {
          // Continue to the login page
          next();
        }
      },
    },
  },
  {
    path: "/forgot-password",
    name: "Forgot-password",
    component: () => import("@/views/pages/account/forgot-password"),
    meta: {
      beforeResolve(routeTo, routeFrom, next) {
        // If the user is already logged in
        if (store.getters["auth/loggedIn"]) {
          // Redirect to the home page instead
          next({ name: "home" });
        } else {
          // Continue to the login page
          next();
        }
      },
    },
  },
  {
    path: "/logout",
    name: "logout",
    meta: {
      authRequired: true,
      beforeResolve(routeTo, routeFrom, next) {
        store.dispatch("auth/logOut").then(() => {});
        const authRequiredOnPreviousRoute = routeFrom.matched.some((route) =>
          route.push("/login")
        );
        next(authRequiredOnPreviousRoute ? { name: "home" } : { ...routeFrom });
        // Navigate back to previous page, or home as a fallback
      },
    },
  },
];
