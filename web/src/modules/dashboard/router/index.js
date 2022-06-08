
const routes = [
{
  path: "/dashboard",
  name: "Dashboard",
  component: () =>
    import ("../views/Dashboard.vue"),
  meta: { requiresAuth: false }
},
];

export default routes;