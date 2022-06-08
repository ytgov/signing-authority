
const routes = [
  {

      path: "",
      name: "test",
      component: () =>
        import("../views/test.vue"),
      meta: { requiresAuth: false },
  },
  {
    path: "/:id",
    name: "Details",
    component: () =>
      import("../views/AuthorityDetails.vue"),
    meta: { requiresAuth: false },
    children: [
      {
        path: "/edit",
        name: "AuthorityDetailsEdit",
        component: () =>
          import("../views/AuthorityDetailsEdit.vue"),
        meta: { requiresAuth: false }
      }
    ]
  },
  // {
  //       path: "/form-b/:id/edit",
  //       name: "AuthorityDetailsEdit",
  //       component: () =>
  //         import("../views/AuthorityDetailsEdit.vue"),
  //       meta: { requiresAuth: false }
  // },
];


export default routes;
