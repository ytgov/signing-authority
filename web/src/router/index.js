import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Home",
    component: () => { import("../views/Home.vue") }
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: () => { import("../views/Dashboard.vue") },
    meta: { requiresAuth: false }
  },
  {
    path: "/search",
    name: "Search",
    component: () => import("../views/Search.vue"),
    meta: { requiresAuth: false }
  },
  {
    path: "/form-b/:id",
    name: "AuthorityDetails",
    component: () => import("../views/AuthorityDetails.vue"),
    meta: { requiresAuth: false }
  },
  {
    path: "/form-b/:id/edit",
    name: "AuthorityDetailsEdit",
    component: () => import("../views/AuthorityDetailsEdit.vue"),
    meta: { requiresAuth: false }
  },
  {
    path: "/sign-in",
    name: "Login",
    component: () => { import("../views/Login") }
  },
  {
    path: "/login-complete",
    name: "LoginComplete",
    component: () => { "../views/LoginComplete" }
  },
  {
    path: "/profile",
    name: "Profile",
    component: () => { import("../views/Profile") },
    meta: { requiresAuth: true }
  },

  {
    path: "/administration",
    name: "AdministrationHome",
    component: () => { import("../views/Administration/Home") },
    meta: { requiresAuth: true },
  },
  {
    path: "/administration/users",
    name: "AdminUsers",
    component: () => { import("../views/Administration/Users") },
    meta: { requiresAuth: true },
  },
  {
    path: "/employee/:id",
    name: "EmployeeDetail",
    component: () => { import("../views/Employee/Detail") },
    meta: { requiresAuth: true },
  },
  {
    path: "*",
    name: "Not Found",
    component: () => { import("../views/NotFound.vue") }
  }
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});

import store from "../store";

router.beforeEach(async (to, from, next) => {
  var requiresAuth = to.meta.requiresAuth || false;

  if (!requiresAuth) {
    return next();
  }

  await store.dispatch("checkAuthentication");
  var isAuthenticated = store.getters.isAuthenticated;

  if (requiresAuth && !isAuthenticated) {
    console.log("You aren't authenticatd, redirecting to sign-in")
    next("/sign-in");
    return;
  }

  return next();
});

export default router;
