import formBroutes from "../formB/router"

console.log(...formBroutes)
const routes = [
  {
    path: "/form-b",
    component: () =>
          import ("../views/formsViewLayout.vue"),
    children: [
      ...formBroutes,
  ]
  }
];

export default routes;
