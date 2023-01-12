const routes = [
  {
    path: ":departmentId/positions/branch/:branchName",
    name: "FormABranchDetails",
    component: () => import("../views/formAAuthorityBranchDetails.vue"),
    meta: { requiresAuth: true }
  },
  {
    path: ":departmentId/positions/:formAId",
    name: "FormADetails",
    component: () => import("../views/PositionDetails.vue"),
    meta: { requiresAuth: true }
  },
  {
    path: ":departmentId/positions/:formAId/edit",
    name: "FormAEdit",
    component: () => import("../views/PositionDetailsEdit.vue"),
    meta: { requiresAuth: true }
  }
];

export default routes;
