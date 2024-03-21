
const routes = [
  {
    path: "/reports",
    component: () => import("@/layouts/Layout"),
    children: [
      {
        name: "ReportDashboard",
        path: "",
        meta: { requiresAuth: true },
        component: () => import("../views/ReportDashboard.vue"),
      },
    ]
  }
];

export default routes;
