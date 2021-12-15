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
    icon: "ri-user-settings-line",
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
];
