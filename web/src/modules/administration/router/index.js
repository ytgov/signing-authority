
const routes = [
  {
    path: "/administration",
    name: "AdministrationHome",
    component: () =>
      import("../views/Home.vue"),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'users',
        name: "AdminUsers",
        component: () =>
          import("../views/Users"),
        meta: { requiresAuth: true },
      }
    ]
  },
]

export default routes;
