
const routes = [
    {
        path: "/departments",
        component: () => import("@/layouts/Layout"),
        children: [
          {
            name: "Departments",
            path: "",
            meta: { requiresAuth: true },
            component: () => import("../views/DepartmentList.vue"),
          },
          {
            name: "DepartmentDetail",
            path: ":id",
            meta: { requiresAuth: true },
            component: () => import("../views/DepartmentDetail.vue"),
          },
        ]
    }
];

export default routes;
