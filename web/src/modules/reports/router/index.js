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
      {
        name: "Vroozi",
        path: "vroozi",
        meta: { requiresAuth: true },
        component: () => import("../views/Vroozi.vue"),
      },
      {
        name: "FormB",
        path: "form-b",
        meta: { requiresAuth: true },
        component: () => import("../views/FormB.vue"),
      },
      {
        name: "Position",
        path: "position",
        meta: { requiresAuth: true },
        component: () => import("../views/Position.vue"),
      },
    ],
  },
];

export default routes;
