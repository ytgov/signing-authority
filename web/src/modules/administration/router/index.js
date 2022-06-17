
  {
    path: "/administration",
    name: "AdministrationHome",
    component: () =>
      import("../views/Administration/Home.vue"),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'users',
        name: "AdminUsers",
        component: () =>
          import("../views/Administration/Users"),
        meta: { requiresAuth: true },
      }
    ]
  },
