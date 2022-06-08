import formBroutes from "../formB/router"

console.log(...formBroutes)
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
