
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
        path: ":departmentId/positions",
        meta: { requiresAuth: true },
        component: () => import("../views/DepartmentPositionList.vue"),
      },
      {
        name: "DepartmentFormBList",
        path: ":departmentId/form-b",
        meta: { requiresAuth: true },
        component: () => import("../views/DepartmentFormBList.vue"),
      },
      {
        name: "DepartmentPendingGroups",
        path: ":departmentId/form-a",
        meta: { requiresAuth: true },
        component: () => import("../views/DepartmentPendingGroups.vue"),
      },
      {
        name: "DepartmentPendingGroupDetail",
        path: ":departmentId/form-a/:formAId",
        meta: { requiresAuth: true },
        component: () => import("../views/DepartmentPendingGroupDetail.vue"),
      },
      ...formAroutes,
    ]
  },
];

export default routes;