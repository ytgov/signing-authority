import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";
import Dashboard from "../views/Dashboard.vue";
import NotFound from "../views/NotFound.vue";
import Login from "../views/Login";
import LoginComplete from "../views/LoginComplete";
import Profile from "../views/Profile";

import AdministrationHome from "../views/Administration/Home";
import AdministrationUsers from "../views/Administration/Users";

import EmployeeDetail from "../views/Employee/Detail";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: Dashboard,
    meta: {
      requiresAuth: false
    }
  },
  {
    path: "/search",
    name: "Search",
    component: () =>
      import("../views/Search.vue"),
    meta: {
      requiresAuth: false
    }
  },
  {
    path: "/detail",
    name: "Details",
    component: () =>
      import("../views/AuthorityDetails.vue"),
    meta: {
      requiresAuth: false
    }
  },
  {
    path: "/sign-in",
    name: "Login",
    component: Login
  },
  {
    path: "/login-complete",
    name: "LoginComplete",
    component: LoginComplete
  },
  {
    path: "/profile",
    name: "Profile",
    component: Profile,
    meta: {
      requiresAuth: true
    }
  },

  {
    path: "/administration",
    name: "AdministrationHome",
    component: AdministrationHome,
    meta: {
      requiresAuth: true
    },
  },
  {
    path: "/administration/users",
    name: "AdminUsers",
    component: AdministrationUsers,
    meta: {
      requiresAuth: true
    },
  },
  {
    path: "/employee/:id",
    name: "EmployeeDetail",
    component: EmployeeDetail,
    meta: {
      requiresAuth: true
    },
  },
  {
    path: "*",
    name: "Not Found",
    component: NotFound
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
