import formBroutes from "../formB/router"
import formAroutes from "../formA/router"

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
];

export default routes;
