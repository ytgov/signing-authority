import formBroutes from "../formB/router"

const routes = [
  {
    path: "/departments/:departmentId/form-b",
    component: () =>
      import("@/layouts/Layout.vue"),
    children: [
      ...formBroutes,
    ]
  },
 /*  {
    path: "/departments/:departmentId/form-a",
    component: () =>
      import("@/layouts/Layout.vue"),
    children: [
      ...formAroutes,
    ]
  }, */
];

export default routes;
