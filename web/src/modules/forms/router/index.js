import formBroutes from "../formB/router"

const routes = [
  {
    path: "/form-b",
    component: () =>
          import ("@/layouts/blank-layout/Blanklayout.vue"),
    children: [
      ...formBroutes,
  ]
  }
];

export default routes;
