const routes = [
  {
    path: ":departmentId/form-a/branch/:branchName",
    name: "FormABranchDetails",
    component: () => import("../views/formAAuthorityBranchDetails.vue"),
    meta: { requiresAuth: true }
  },
  {
    path: ":departmentId/form-a/:formAId",
    name: "FormADetails",
    component: () => import("../views/formAAuthorityDetails.vue"),
    meta: { requiresAuth: true }
  },
  {
    path: ":departmentId/form-a/:formAId/edit",
    name: "FormAEdit",
    component: () => import("../views/formAAuthorityDetailsEdit.vue"),
    meta: { requiresAuth: true }
  }
];

export default routes;
