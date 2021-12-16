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
        id: 9,
        label: "Salary Allowances",
        link: "/salary-allowances",
      },
      {
        id: 10,
        label: "Payroll Setup",
        link: "/payroll-setup",
      },
    ],
  },
  {
    id: 11,
    label: "HR Configuration",
    icon: "ri-user-settings-line",
    subItems: [
      {
        id: 12,
        label: "Banks",
        link: "/banks",
      },
      {
        id: 13,
        label: "Pension",
        link: "/pension",
      },
      {
        id: 14,
        label: "HMO",
        link: "/hmo",
      },
      {
        id: 15,
        label: "Departments",
        link: "/departments",
      },
      {
        id: 16,
        label: "Grades",
        link: "/grades",
      },
      {
        id: 17,
        label: "Job Roles",
        link: "/job-roles",
      },
      {
        id: 18,
        label: "Locations",
        link: "/locations",
      },
      {
        id: 19,
        label: "Appraisal",
        link: "/appraisal",
      },
      {
        id: 20,
        label: "Qualifications",
        link: "/qualifications",
      },
      {
        id: 21,
        label: "Subsidiary",
        link: "/subsidiary",
      },
      {
        id: 22,
        label: "Leave Types",
        link: "/leave-types",
      },
      {
        id: 23,
        label: "Training",
        link: "/training",
      },
      {
        id: 24,
        label: "Documents",
        link: "/documents",
      },
    ],
  },
];
