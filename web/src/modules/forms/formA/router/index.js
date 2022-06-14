const routes = [
  {
    path: ":id",
    name: "Details",
    component: () =>
      import("../views/formAAuthorityDetails.vue"),
    meta: { requiresAuth: false },

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
]


export default routes;