export default [
    {
        path: "/time-sheet-authorization",
        name: "time-sheet-authorization",
        meta: {
            authRequired: true,
        },
        component: () =>
            import("@/views/pages/authorizations/timesheet/index"),
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
