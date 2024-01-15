const routes = [
  {
    path: "/administration",
    component: () => import("@/layouts/Layout"),
    meta: { requiresAuth: true },
    children: [
      {
        name: "AdministrationHome",
        path: "",
        meta: { requiresAuth: true },
        component: () => import("../views/Home.vue"),
      },
      {
        path: "users",
        name: "AdminUsers",
        component: () => import("../views/Users"),
        meta: { requiresAuth: true },
      },
      {
        path: "form-a",
        name: "AdminFormA",
        component: () => import("../views/FormA"),
        meta: { requiresAuth: true },
      },
      {
        path: "positions",
        name: "AdminPositions",
        component: () => import("../views/Positions"),
        meta: { requiresAuth: true },
      },
      {
        path: "operational-restrictions",
        name: "OperationalRestrictions",
        component: () => import("../views/OperationalRestrictions"),
        meta: { requiresAuth: true },
      },
    ],
  },
];

export default routes;
