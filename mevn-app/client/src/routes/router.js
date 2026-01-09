import { createRouter, createWebHistory } from "vue-router";

const routes = [
  { path: "/", redirect: "/dashboard" },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: () => import("../components/Dashboard.vue"),
  },
  {
    path: "/plan",
    name: "Plan",
    component: () => import("../components/MapPlan.vue"),
  },
  {
    path: "/world",
    name: "World",
    component: () => import("../components/World.vue"),
  },
  {
    path: "/trips",
    name: "PastTrips",
    component: () => import("../components/PastTrips.vue"),
  },
  {
    path: "/live",
    name: "Live",
    component: () => import("../components/Live.vue"),
  },
  {
    path: "/discover",
    name: "Discover",
    component: () => import("../components/Discover.vue"),
  },
  {
    path: "/rewards",
    name: "Rewards",
    component: () => import("../components/Rewards.vue"),
  },
  {
    path: "/tips",
    name: "Tips",
    component: () => import("../components/Tips.vue"),
  },
  {
    path: "/feedback",
    name: "Feedback",
    component: () => import("../components/Feedback.vue"),
  },
  {
    path: "/admin",
    name: "Admin",
    component: () => import("../components/Admin.vue"),
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import("../components/Login.vue"),
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: () => import("../components/ResetPassword.vue"),
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import("../components/ForgotPassword.vue"),
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import("../components/Profile.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

const publicRoutes = ['Login', 'ResetPassword', 'ForgotPassword'];
const publicPaths = ['/login', '/reset-password', '/forgot-password'];

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  const isAuthenticated = !!token;
  
  const isPublicRoute = publicRoutes.includes(to.name) || publicPaths.includes(to.path);
  
 
  if (to.path === '/reset-password') {
    return next();
  }
  
  if (isPublicRoute && isAuthenticated) {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      if (user.role === 'AdminGeneral' || user.role === 'AdminForum') {
        return next('/admin');
      }
    }
    return next('/dashboard');
  }
  
  if (!isPublicRoute && !isAuthenticated) {
    return next('/login');
  }
  
  next();
});

export default router;
