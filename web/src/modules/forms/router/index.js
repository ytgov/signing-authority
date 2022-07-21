//import formAroutes from '../formA/router';
import formBroutes from "../formB/router"

const routes = [
  {
    path: "/form-b",
    meta: { requiresAuth: true },
    component: () =>
      import("@/layouts/Layout.vue"),
    children: [
      ...formBroutes,
    ]
  },
 /*  {
    path: "/departments/:departmentId/form-a",
    meta: { requiresAuth: true },
    component: () =>
      import("@/layouts/Layout.vue"),
    children: [
      ...formAroutes,
    ]
  }, */
];

export default routes;
