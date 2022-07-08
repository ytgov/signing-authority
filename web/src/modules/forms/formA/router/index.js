const routes = [
  // {
  //   // path: "/departments/:departmentId/form-a/:id",
  //   // name: "DeptFormADetails",
  //   // component: () =>
  //   //   import("../views/formAAuthorityDetails.vue"),
  //   // meta: { requiresAuth: true },

  //   // children: [
  //   // This doesn't seem to pass :id along to the coponent so it'so
  //   // seems  best to make it its own top level route.
  //   //   {
  //   //     path: "edit",
  //   //     name: "AuthorityDetailsEdit",
  //   //     component: () =>
  //   //       import("../views/AuthorityDetailsEdit.vue"),
  //   //     meta: { requiresAuth: false }
  //   //   }
  //   // ]
  // },
  {
    path: ":id",
    name: "FormADetails",
    component: () =>
      import("../views/formAAuthorityDetails.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: ":id/edit",
    name: "FormAEdit",
    component: () =>
      import("../views/formAAuthorityDetailsEdit.vue"),
    meta: { requiresAuth: true }
  }
]


export default routes;