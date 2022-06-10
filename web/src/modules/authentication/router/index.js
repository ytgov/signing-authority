
const routes = [
  {
    path: "/sign-in",
    name: "SignIn",
    component: () =>
      import("../views/SignIn.vue"),
  },
  {
    path: "/profile",
    name: "Profile",
    component: () =>
      import("../views/Profile.vue"),
    meta: { requiresAuth: true }
  },
];

export default routes;