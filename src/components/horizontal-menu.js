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
    link: "/profile",
  },

  {
    id: 3,
    label: "Service Forms",
    icon: "ri-user-settings-line",
    subItems: [
      {
        id: 4,
        label: "Leave Application",
        link: "/leave-application",
      },

      {
        id: 5,
        label: "TimeSheet",
        link: "/timesheet",
      },

      {
        id: 6,
        label: "Travel Authorization",
        subItems: [
          {
            id: 6,
            label: "New Travel Request",
            link: "/travel-authorization",
          },
          {
            id: 6,
            label: "View Travel Requests",
            link: "/travel-requests",
          },
        ],
      },


    ],
  },

  {
    id: 7,
    label: "Assessment",
    icon: "ri-user-settings-line",
    subItems: [
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
