import store from "@/state/store";

export default [
  {
    path: "/login",
    name: "login",
    component: () => import("../views/pages/account/login"),
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
    component: () => import("../views/pages/account/forgot-password"),
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
        store.dispatch("auth/logOut").then(() => {
          const authRequiredOnPreviousRoute = routeFrom.matched.some((route) =>
            route.push("/login")
          );
          next(
            authRequiredOnPreviousRoute ? { name: "home" } : { ...routeFrom }
          );
        });
        // Navigate back to previous page, or home as a fallback
      },
    },
  },
  {
    path: "/",
    name: "home",
    meta: {
      authRequired: true,
    },
    component: () => import("../views/pages/dashboard/index"),
  },
  {
    path: "/users",
    name: "users",
    meta: {
      authRequired: true,
    },
    component: () => import("@/views/pages/users/index"),
  },
  // payroll configuration routes start //
  {
    path: "/payment-definitions",
    name: "payment-definitions",
    meta: {
      authRequired: true,
    },
    component: () =>
      import("../views/pages/payroll-configuration/payment-definitions"),
  },
  {
    path: "/tax-rates",
    name: "tax-rates",
    meta: {
      authRequired: true,
    },
    component: () => import("../views/pages/payroll-configuration/tax-rates"),
  },
  // payroll configuration routes end //

  // hr configuration routes start //
  {
    path: "/banks",
    name: "banks",
    meta: {
      authRequired: true,
    },
    component: () => import("../views/pages/hr-configuration/banks"),
  },
  {
    path: "/departments",
    name: "departments",
    meta: {
      authRequired: true,
    },
    component: () => import("../views/pages/hr-configuration/departments"),
  },
  {
    path: "/grades",
    name: "grades",
    meta: {
      authRequired: true,
    },
    component: () => import("../views/pages/hr-configuration/grades"),
  },
  // hr configuration routes end //
];
