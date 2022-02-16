export const menuItems = [
  {
    id: 1,
    label: "Administrative Menu",
    isTitle: true,
  },

  {
    id: 2,
    label: "Dashboard",
    icon: "ri-dashboard-line",
    badge: {
      variant: "success",
      text: "menuitems.dashboard.badge",
    },
    link: "/",
  },
  {
    id: 3,
    label: "Configuration",
    isTitle: true,
  },
  {
    id: 4,
    label: "Users",
    icon: "ri-team-line",
    link: "/users",
  },
  {
    id: 5,
    label: "Payroll Configuration",
    icon: "ri-pages-line",
    subItems: [
      {
        id: 6,
        label: "Payment Definitions",
        link: "/payment-definitions",
      },
      {
        id: 7,
        label: "Tax Rates",
        link: "/tax-rates",
      },
      {
        id: 8,
        label: "Salary Structures",
        link: "/salary-structures",
      },
      {
        id: 10,
        label: "Payroll Setup",
        link: "/payroll-setup",
      },
      {
        id: 10,
        label: "Salary Grades",
        link: "/salary-grades",
      },
      {
        id: 10,
        label: "Donors",
        link: "/donors",
      },
      {
        id: 10,
        label: "Location Allowances",
        link: "/location-allowances",
      },
      {
        id: 10,
        label: "Grant Charts",
        link: "/grant-charts",
      },
    ],
  },
  {
    id: 11,
    label: "HR Configuration",
    icon: "ri-user-settings-line",
    subItems: [
      {
        id: 11,
        label: "House Keeping",
        subItems: [
          {
            id: 12,
            label: "Banks",
            link: "/banks",
          },
          {
            id: 13,
            label: "Pension Providers",
            link: "/pension-providers",
          },
          {
            id: 14,
            label: "HMOs",
            link: "/hmos",
          },
          {
            id: 15,
            label: "Grades",
            link: "/grades",
          },
          {
            id: 16,
            label: "Departments",
            link: "/departments",
          },
          {
            id: 17,
            label: "Job Roles",
            link: "/job-roles",
          },
          {
            id: 18,
            label: "States",
            link: "/states",
          },
          {
            id: 19,
            label: "Locations",
            link: "/locations",
          },
        ],
      },
      {
        id: 12,
        label: "Self-Assessment",
        subItems: [
          {
            id: 24,
            label: "Ratings",
            link: "/ratings",
          },
          {
            id: 20,
            label: "Goal Settings",
            link: "/goal-settings",
          },
          {
            id: 33,
            label: "End of Year Questions",
            link: "/end-of-year",
          },
        ],
      },
      {
        id: 21,
        label: "Qualifications",
        link: "/qualifications",
      },
      {
        id: 22,
        label: "Subsidiaries",
        link: "/subsidiaries",
      },
      {
        id: 23,
        label: "Leave Types",
        link: "/leave-types",
      },
      {
        id: 26,
        label: "Public Holidays",
        link: "/public-holidays",
      },
    ],
  },
  {
    id: 26,
    label: "Employee Management",
    isTitle: true,
  },
  {
    id: 27,
    label: "Employee",
    icon: "ri-user-settings-line",
    subItems: [
      {
        id: 28,
        label: "New Employee",
        link: "/new-employee",
      },

      {
        id: 30,
        label: "Manage Employees",
        link: "/manage-employees",
      },

      {
        id: 31,
        label: "Supervisors",
        link: "/supervisors",
      },

      {
        id: 32,
        label: "Supervisor Assignment",
        link: "/assign-supervisor",
      },
    ],
  },
  {
    id: 29,
    label: "Employee Leaves",
    icon: "ri-user-settings-line",
    link: "/employee-leave",
  },
  {
    id: 26,
    label: "Self-Service",
    isTitle: true,
  },
  {
    id: 29,
    label: "Leave Application",
    icon: "ri-walk-line",
    link: "/manage-leave-applications",
  },
  {
    id: 29,
    label: "Travel Application",
    icon: "ri-flight-takeoff-line",
    link: "",
  },
  {
    id: 29,
    label: "Time Sheet",
    icon: "ri-calendar-event-line",
    link: "",
  },
  {
    id: 29,
    label: "Self Assessment",
    icon: "ri-file-edit-line",
    link: "",
  },
  {
    id: 26,
    label: "Payroll Routine",
    isTitle: true,
  },
  {
    id: 27,
    label: "Variations",
    icon: "ri-device-recover-line",
    subItems: [
      {
        id: 28,
        label: "Setup Variation",
        link: "/new-variation",
      },
      {
        id: 30,
        label: "Confirm Variation",
        link: "confirm-variation",
      },
    ],
  },
  {
    id: 27,
    label: "Process Payroll",
    icon: " ri-exchange-funds-line",
    subItems: [
      {
        id: 28,
        label: "Process Payroll Routine",
        link: "",
      },
      {
        id: 30,
        label: "Approve Payroll Routine",
        link: "",
      },
    ],
  },
];
