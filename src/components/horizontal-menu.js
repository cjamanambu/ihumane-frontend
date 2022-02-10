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
    icon: "ri-account-box-line",
    link: "/profile",
  },

  {
    id: 3,
    label: "Service Forms",
    icon: "ri-file-list-2-line",
    subItems: [
      {
        id: 4,
        label: "Leave Application",
        link: "/leave-application",
      },

      {
        id: 5,
        label: "Timesheet",
        link: "/timesheet",
      },
      {
        id: 6,
        label: "Travel Requests",
        link: "/travel-requests",
      },
    ],
  },

  {
    id: 7,
    label: "Assessment",
    icon: "ri-survey-line",
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
    icon: "ri-bank-card-line",
    subItems: [
      {
        id: 8,
        label: "PaySlips",
        link: "/pay-slips",
      },
    ],
  },

  {
    id: 9,
    label: "Authorizations",
    icon: "ri-user-follow-line",
    subItems: [
      {
        id: 10,
        label: "Travel Authorization",
        link: "/travel-authorization",
      },
      {
        id: 10,
        label: "TimeSheet Authorization",
        link: "/time-sheet-authorization",
      },
      {
        id: 10,
        label: "Leave Authorization",
        link: "/leave-authorization",
      },
    ],
  },
];
