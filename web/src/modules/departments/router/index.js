import { authenticationGuard } from '@/auth/authenticationGuard';

const routes = [
    {
        path: "/departments",
        name: "Departments",
        beforeEnter: authenticationGuard,
        component: () =>
            import("../views/DepartmentList.vue"),
        meta: { requiresAuth: true }
    },
];

export default routes;