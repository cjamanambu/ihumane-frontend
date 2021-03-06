import store from "@/state/store";

const permissions = store.getters["auth/permissions"];
console.log(permissions);

const menuItems = [
  {
    id: 1,
    label: "Administrative Menu",
    isTitle: true,
  },
  {
    id: 2,
    label: "Dashboard",
    icon: "ri-dashboard-line",
    // badge: {
    //   variant: "success",
    //   text: "menuitems.dashboard.badge",
    // },
    link: "/",
  },
  permissions.includes("MANAGE_USER") ||
  permissions.includes("PAYROLL_CONFIG") ||
  permissions.includes("HR_CONFIG")
    ? {
        id: 3,
        label: "Configuration",
        isTitle: true,
      }
    : {},
  permissions.includes("MANAGE_USER")
    ? {
        id: 4,
        label: "Users",
        icon: "ri-team-line",
        link: "/users",
      }
    : {},
  permissions.includes("PAYROLL_CONFIG")
    ? {
        id: 5,
        label: "Payroll Configuration",
        icon: "ri-pages-line",
        subItems: [
          permissions.includes("PAYMENT_DEFINITION")
            ? {
                id: 6,
                label: "Payment Definitions",
                link: "/payment-definitions",
              }
            : {},
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
      }
    : {},
  permissions.includes("HR_CONFIG")
    ? {
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
                id: 16,
                label: "Sectors",
                link: "/departments",
              },
              {
                id: 123,
                label: "Authorization Role",
                link: "/authorization-roles",
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
                id: 188,
                label: "LGAs",
                link: "/local-government-areas",
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
      }
    : {},
  {
    id: 26,
    label: "Employee Management",
    isTitle: true,
  },
  {
    id: 27,
    label: "Employee",
    icon: " ri-account-circle-line",
    subItems: [
      permissions.includes("ONBOARD_EMPLOYEE")
        ? {
            id: 28,
            label: "New Employee",
            link: "/new-employee",
          }
        : {},
      permissions.includes("MANAGE_EMPLOYEE")
        ? {
            id: 30,
            label: "Manage Employees",
            link: "/manage-employees",
          }
        : {},
      permissions.includes("ASSIGN_SUPERVISORS")
        ? {
            id: 31,
            label: "Supervisors",
            link: "/supervisors",
          }
        : {},
      permissions.includes("ASSIGN_SUPERVISORS")
        ? {
            id: 32,
            label: "Supervisor Assignment",
            link: "/assign-supervisor",
          }
        : {},
    ],
  },
  permissions.includes("ANNOUNCEMENT") || permissions.includes("QUERY")
    ? {
        id: 26,
        label: "Communication",
        isTitle: true,
      }
    : {},
  permissions.includes("ANNOUNCEMENT")
    ? {
        id: 299,
        label: "Announcement",
        icon: "ri-error-warning-line",
        link: "/manage-announcements",
      }
    : {},
  permissions.includes("QUERY")
    ? {
        id: 209,
        label: "Query",
        icon: "ri-file-list-2-line",
        link: "/manage-queries",
      }
    : {},
  permissions.includes("LEAVE_MANAGEMENT") ||
  permissions.includes("TRAVEL") ||
  permissions.includes("TIMESHEET") ||
  permissions.includes("LEAVE_MANAGEMENT")
    ? {
        id: 26,
        label: "Self-Service",
        isTitle: true,
      }
    : {},
  permissions.includes("LEAVE_MANAGEMENT")
    ? {
        id: 27,
        label: "Leave Management",
        icon: "ri-walk-line",
        subItems: [
          {
            id: 28,
            label: "All Leave Applications",
            link: "/leave-applications",
          },
          permissions.includes("LEAVE")
            ? {
                id: 30,
                label: "Manage Leave",
                link: "/manage-leave-applications",
              }
            : {},
          {
            id: 31,
            label: "Employee Leave Accruals",
            link: "/employee-leave-accruals",
          },
        ],
      }
    : {},
  permissions.includes("TRAVEL")
    ? {
        id: 29,
        label: "Travel Application",
        icon: "ri-flight-takeoff-line",
        link: "/manage-travel-applications",
      }
    : {},
  permissions.includes("TIMESHEET")
    ? {
        id: 29,
        label: "Time Sheet",
        icon: "ri-calendar-event-line",
        link: "/manage-time-sheets",
      }
    : {},
  permissions.includes("SELF_ASSESSMENT")
    ? {
        id: 31,
        label: "Self Assessment",
        icon: "ri-team-line",
        link: "/self-assessment/backoffice",
      }
    : {},
  // {
  //   id: 26,
  //   label: "Leave Management",
  //   isTitle: true,
  // },
  // {
  //   id: 29,
  //   label: "Employee Leaves",
  //   icon: "ri-user-settings-line",
  //   link: "/employee-leave",
  // },
  {
    id: 26,
    label: "Communication",
    isTitle: true,
  },
  {
    id: 299,
    label: "Announcement",
    icon: "ri-error-warning-line",
    link: "/manage-announcements",
  },
  {
    id: 209,
    label: "Query",
    icon: "ri-file-list-2-line",
    link: "/manage-queries",
  },
  {
    id: 26,
    label: "Self-Service",
    isTitle: true,
  },
  {
    id: 27,
    label: "Leave Management",
    icon: "ri-walk-line",
    subItems: [
      {
        id: 28,
        label: "All Leave Applications",
        link: "/leave-applications",
      },

      {
        id: 30,
        label: "Manage Leave",
        link: "/manage-leave-applications",
      },

      {
        id: 31,
        label: "Employee Leave Accruals",
        link: "/employee-leave-accruals",
      },
    ],
  },
  {
    id: 29,
    label: "Travel Application",
    icon: "ri-flight-takeoff-line",
    link: "/manage-travel-applications",
  },
  {
    id: 29,
    label: "Time Sheet",
    icon: "ri-calendar-event-line",
    link: "/manage-time-sheets",
  },
  {
    id: 31,
    label: "Self Assessment",
    icon: "ri-team-line",
    link: "/self-assessment/backoffice",
  },
  permissions.includes("APPLICATION_TRACKING")
    ? {
        id: 29,
        label: "Application Tracking",
        icon: "ri-file-edit-line",
        link: "/application-tracking",
      }
    : {},
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
      permissions.includes("SETUP_VARIATIONS")
        ? {
            id: 28,
            label: "Setup Variation",
            link: "/new-variation",
          }
        : {},
      {
        id: 28,
        label: "Manage Variation",
        link: "/current-variation",
      },
      permissions.includes("CONFIRM_VARIATIONS") ||
      permissions.includes("APPROVE_VARIATIONS") ||
      permissions.includes("DECLINE_VARIATIONS")
        ? {
            id: 30,
            label: "Confirm Variation",
            link: "/confirm-variation",
          }
        : {},
      {
        id: 31,
        label: "Default Charges",
        link: "/default-charges",
      },
    ],
  },
  permissions.includes("RUN_PAYROLL") ||
  permissions.includes("UNDO_PAYROLL") ||
  permissions.includes("CONFIRM_PAYROLL") ||
  permissions.includes("APPROVE_PAYROLL")
    ? {
        id: 27,
        label: "Process Payroll",
        icon: " ri-exchange-funds-line",
        subItems: [
          permissions.includes("RUN_PAYROLL") ||
          permissions.includes("UNDO_PAYROLL") ||
          permissions.includes("CONFIRM_PAYROLL")
            ? {
                id: 28,
                label: "Process Payroll Routine",
                link: "/process-payroll",
              }
            : {},
          permissions.includes("APPROVE_PAYROLL")
            ? {
                id: 30,
                label: "Approve Payroll Routine",
                link: "/approve-payroll",
              }
            : {},
        ],
      }
    : {},
  permissions.includes("JOURNAL_CODE_SETUP") ||
  permissions.includes("SALARY_MAPPING") ||
  permissions.includes("PAYROLL_JOURNAL")
    ? {
        id: 27,
        label: "Payroll Journal",
        icon: "ri-book-2-line",
        subItems: [
          permissions.includes("JOURNAL_CODE_SETUP")
            ? {
                id: 28,
                label: "Journal Code Setup",
                link: "/journal-code",
              }
            : {},
          permissions.includes("SALARY_MAPPING")
            ? {
                id: 30,
                label: "Salary Mappings",
                link: "/salary-mappings",
              }
            : {},
          permissions.includes("PAYROLL_JOURNAL")
            ? {
                id: 30,
                label: "Journal Report",
                link: "/journal-report",
              }
            : {},
        ],
      }
    : {},
  {
    id: 2,
    label: "Reports",
    icon: "ri-pie-chart-2-line",
    link: "/reports",
  },
];

export { menuItems };
