export const menuItems = [
  {
    id: 1,
    label: "menuitems.dashboard.text",
    icon: "ri-dashboard-line",
    link: "/",
  },

  {
    id: 2,
    label: "Profile",
    icon: "ri-dashboard-line",
    link: "/",
  },

  {
    id: 3,
    label: "Service Forms",
    icon: "ri-user-settings-line",
    subItems: [
      {
        id: 4,
        label: "Leave Authorization",
        link: "/new-employee",
      },

      {
        id: 5,
        label: "TimeSheet",
        link: "/timesheet",
      },

      {
        id: 6,
        label: "Travel Authorization",
        link: "/supervisors",
      },

      {
        id: 11,
        label: "Self Assessment",
        link: "/self-assessment",
      },

      {
        id: 11,
        label: "Assess Employee",
        link: "/assess-employee",
      },

    ],
  },

  {
    id: 7,
    label: "Payroll",
    icon: "ri-user-settings-line",
    subItems: [
      {
        id: 8,
        label: "PaySlips",
        link: "/new-employee",
      },

    ],
  },

  {
    id: 9,
    label: "Authorizations",
    icon: "ri-user-settings-line",
    subItems: [
      {
        id: 10,
        label: "PaySlips",
        link: "/new-employee",
      },

    ],
  },
];
