import Vue from "vue";
import VueRouter from "vue-router";

import dashboardRoutes from "@/modules/dashboard/router";
import formRoutes from "@/modules/forms/router";
import authenticationRoutes from "@/modules/authentication/router";


Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Default",
    component: () =>
      import("../views/Default.vue"),
  },

  ...dashboardRoutes,
  ...formRoutes,
  ...authenticationRoutes,

  {
    path: "/search",
    name: "Search",
    component: () =>
      import("../views/Search.vue"),
    meta: { requiresAuth: false }
  },

  // {
  //   path: "/sign-in",
  //   name: "Login",
  //   component: () =>
  //     import ("../views/Login.vue"),
  // },
  // {
  //   path: "/login-complete",
  //   name: "LoginComplete",
  //   component: () =>
  //     import("../views/LoginComplete.vue"),
  // },
  // {
  //   path: "/profile",
  //   name: "Profile",
  //   component: () =>
  //     import("../views/Profile.vue"),
  //   meta: { requiresAuth: true }
  // },

  {
    path: "/administration",
    name: "AdministrationHome",
    component: () =>
      import("../views/Administration/Home.vue"),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'users',
        name: "AdminUsers",
        component: () =>
          import("../views/Administration/Users"),
        meta: { requiresAuth: true },
      }
    ]
  },

  {
    path: "/employee/:id",
    name: "EmployeeDetail",
    component: () =>
      import("../views/Employee/Detail"),
    meta: { requiresAuth: true },
  },
  {
    path: "*",
    name: "Not Found",
    component: () =>
      import("../views/NotFound.vue"),
  }
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});

import store from "../store";
import { getInstance } from "@/auth/auth0-plugin";
let authService;

router.beforeEach(async (to, from, next) => {
  var requiresAuth = to.meta.requiresAuth || false;

  if (!requiresAuth) {
    return next();
  }

  if (!authService) {
    authService = await getInstance();
  }

  let i = window.setInterval(async () => {
    if (authService.isLoading === false) {
      window.clearInterval(i);

      next(await kick());
    }
  }, 100);
});

async function kick() {
  if (!authService) {
    authService = await getInstance();
  }

  const accessToken = await authService.getTokenSilently();
  let user = await store.dispatch("getCurrentUser", { accessToken });

  if (user && user.status == "Inactive")
    return "inactive";

  return;
}
export default router;
