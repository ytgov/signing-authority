const routes = [
  {
    path: ":id",
    name: "Details",
    component: () =>
      import("../views/AuthorityDetails.vue"),
    meta: { requiresAuth: false },

    children: [
      {
        path: "edit",
        name: "AuthorityDetailsEdit",
        component: () =>
          import("../views/AuthorityDetailsEdit.vue"),
        meta: { requiresAuth: false }
      }
    ]
  },
];


export default routes;
