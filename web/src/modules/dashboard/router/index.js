import { authenticationGuard } from '@/auth/authenticationGuard';

const routes = [
{
  path: "/dashboard",
  name: "Dashboard",
  beforeEnter: authenticationGuard,
  component: () =>
    import ("../views/Dashboard.vue"),
  meta: { requiresAuth: false }
},
];

export default routes;