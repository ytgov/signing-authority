const routes = [
  {
    path: "/departments/:departmentId/form-a/:id",
    name: "DeptFormADetails",
    component: () =>
      import("../views/formAAuthorityDetails.vue"),
    meta: { requiresAuth: true },

    // children: [
    // This doesn't seem to pass :id along to the coponent so it'so
    // seems  best to make it its own top level route.
    //   {
    //     path: "edit",
    //     name: "AuthorityDetailsEdit",
    //     component: () =>
    //       import("../views/AuthorityDetailsEdit.vue"),
    //     meta: { requiresAuth: false }
    //   }
    // ]
  },
  {
    path: "/:id",
    name: "FormADetailsLL",
    component: () =>
      import("../views/formAAuthorityDetails.vue"),
    meta: { requiresAuth: true },
  }
]


export default routes;