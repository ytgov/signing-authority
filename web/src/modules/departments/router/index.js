// import { authenticationGuard } from '@/auth/authenticationGuard';

const routes = [
    {
        path: "/departments",
        name: "Departments",
        // ---TO TEST--
        //I think this is done at the root of the router definiation file
        // the meta flag signals the guard.
        // beforeEnter: authenticationGuard,
        component: () =>
            import("../views/DepartmentList.vue"),
        meta: { requiresAuth: true }
    },
];

export default routes;