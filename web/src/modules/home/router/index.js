
const routes = [
  {
    path: "/",
    component: () => import("@/layouts/Layout"),
    children: [
      {
        name: "Dashboard",
        path: "dashboard",
        meta: { requiresAuth: true },
        component: () => import("../views/Dashboard.vue"),
      },
      {
        name: "Profile",
        path: "profile",
        meta: { requiresAuth: true },
        component: () => import("../views/Profile"),
      },
      {
        name: "Search",
        path: "search",
        meta: { requiresAuth: true },
        component: () => import("../views/Search"),
      },
      {
        name: "CodeSearch",
        path: "code-search",
        meta: { requiresAuth: true },
        component: () => import("../views/CodeSearch"),
      },
    ]
  }
];

export default routes;
