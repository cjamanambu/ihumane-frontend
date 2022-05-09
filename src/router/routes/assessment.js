export default [
  {
    path: "/self-assessment",
    name: "self-assessment",
    meta: {
      authRequired: true,
    },
    component: () => import("@/views/pages/assessment/self-assessment/index"),
  },
  {
    path: "/self-assessment/beginning-of-year",
    name: "beginning-of-year",
    meta: {
      authRequired: true,
    },
    component: () =>
      import("@/views/pages/assessment/self-assessment/beginning-of-year"),
  },
  {
    path: "/self-assessment/mid-year-checking",
    name: "mid-year-checking",
    meta: {
      authRequired: true,
    },
    component: () =>
      import("@/views/pages/assessment/self-assessment/mid-year-checking"),
  },
  {
    path: "/self-assessment/end-of-year",
    name: "end-of-year-assessment",
    meta: {
      authRequired: true,
    },
    component: () =>
      import("@/views/pages/assessment/self-assessment/end-of-year"),
  },
  {
    path: "/assess-employees",
    name: "assess-employees",
    meta: {
      authRequired: true,
    },
    component: () => import("@/views/pages/assessment/assess-employees/index"),
  },
  {
    path: "/assess-employee/:empid",
    name: "assess-employee",
    meta: {
      authRequired: true,
    },
    component: () =>
      import("@/views/pages/assessment/assess-employees/assess-employee"),
  },
  {
    path: "/mid-year-assess-employee/:empid/:gsId/:masterId",
    name: "mid-year-assess-employee",
    meta: {
      authRequired: true,
    },
    component: () =>
      import(
        "@/views/pages/assessment/assess-employees/assess-employee-mid-year"
      ),
  },
  {
    path: "/end-year-assess-employee/:empid",
    name: "end-year-assess-employee",
    meta: {
      authRequired: true,
    },
    component: () =>
      import(
        "@/views/pages/assessment/assess-employees/assess-employee-end-year"
      ),
  },
  {
    path: "/assess-end-year-details/:empid",
    name: "assess-end-year-details",
    meta: {
      authRequired: true,
    },
    component: () =>
      import(
        "@/views/pages/assessment/self-assessment/assess-end-year-details"
      ),
  },
  {
    path: "/assess-mid-year-details/:empid/:gsId/:masterId",
    name: "assess-mid-year-details",
    meta: {
      authRequired: true,
    },
    component: () =>
      import(
        "@/views/pages/assessment/self-assessment/assess-mid-year-details"
      ),
  },
  {
    path: "/assessment-details/:empid/:gsId",
    name: "assessment-details",
    meta: {
      authRequired: true,
    },
    component: () =>
      import("@/views/pages/assessment/self-assessment/assessment-detail"),
  },
];
