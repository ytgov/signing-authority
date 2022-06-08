import formBroutes from "../formB/router"
import formAroutes from "../formA/router"

const routes = [
  {
    path: "/form-b",
    component: () =>
          import ("@/layouts/blank-layout/Blanklayout.vue"),
    children: [
      ...formBroutes,
  ]
  },
  {
    path: "/form-a",
    component: () =>
          import ("@/layouts/blank-layout/Blanklayout.vue"),
    children: [
      ...formAroutes,
  ]
  },
];

export default routes;
