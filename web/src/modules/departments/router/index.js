

// import formAroutes from "@/modules/forms/formA/router"

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
          {
            name: "DepartmentFormAList",
            path: ":id/form-a",
            meta: { requiresAuth: true },
            component: () => import("../views/DepartmentFormAList.vue"),
          },
          {
            name: "DepartmentFormBList",
            path: ":id/form-b",
            meta: { requiresAuth: true },
            component: () => import("../views/DepartmentFormBList.vue"),
          },
          // ...formAroutes
        ]
    },
];

export default routes;