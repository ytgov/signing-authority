
const routes = [
  {
    path: "/sign-in",
    name: "Login",
    component: () =>
      import ("../views/Login.vue"),
  },
  {
    path: "/login-complete",
    name: "LoginComplete",
    component: () =>
      import("../views/LoginComplete.vue"),
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