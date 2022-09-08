
import formAroutes from '@/modules/forms/formA/router';

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
        path: ":departmentId",
        meta: { requiresAuth: true },
        component: () => import("../views/DepartmentDetail.vue"),
      },
      {
        name: "DepartmentPositionList",
        path: ":departmentId/form-a",
        meta: { requiresAuth: true },
        component: () => import("../views/DepartmentPositionList.vue"),
      },
      {
        name: "DepartmentFormBList",
        path: ":departmentId/form-b",
        meta: { requiresAuth: true },
        component: () => import("../views/DepartmentFormBList.vue"),
      },
      ...formAroutes,
    ]
  },
];

export default routes;