import formAroutes from '../formA/router';
import formBroutes from "../formB/router"

const routes = [
  {
    path: "/form-b",
    component: () =>
      import("@/layouts/Layout.vue"),
    children: [
      ...formBroutes,
    ]
  },
  {
    path: "/form-a",
    component: () =>
      import("@/layouts/Layout.vue"),
    children: [
      ...formAroutes,
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
