
const routes = [
  {
    path: "/employee",
    component: () => import("@/layouts/Layout"),
    meta: { requiresAuth: true },
    children: [
      {
        name: "EmployeeDetail",
        path: ":id",
        meta: { requiresAuth: true },
        component: () => import("../views/Detail.vue"),
      },
    ]
  }
];

export default routes;
