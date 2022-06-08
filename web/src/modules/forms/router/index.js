import formBroutes from "../formB/router"

const routes = [
  {
    path: "/form-b",
    children: [
      ...formBroutes
  ]
  }
];

export default routes;
