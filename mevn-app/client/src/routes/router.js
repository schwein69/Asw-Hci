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
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import("../components/ForgotPassword.vue"),
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: () => import("../components/ResetPassword.vue"),
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

// Public routes that don't require authentication
const publicRoutes = ['Login', 'ForgotPassword', 'ResetPassword'];
const publicPaths = ['/login', '/forgot-password', '/reset-password'];

// Navigation guard to protect routes
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  const isPublicRoute = publicRoutes.includes(to.name) || publicPaths.includes(to.path);
  
  // Allow access to public routes
  if (isPublicRoute) {
    // If already logged in and trying to access login page, redirect to dashboard
    if (to.name === 'Login' && token) {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.role === 'GeneralAdmin' || user.role === 'ForumAdmin') {
          next({ name: 'Admin' });
        } else {
          next({ name: 'Dashboard' });
        }
      } catch (e) {
        next(); // If parsing fails, allow access
      }
      return;
    }
    next();
    return;
  }
  
  // If trying to access a protected route without token, redirect to login
  if (!token) {
    next({ name: 'Login' });
    return;
  }
  
  next();
});

export default router;
