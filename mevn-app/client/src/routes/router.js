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
];


const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
