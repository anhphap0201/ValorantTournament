import { createRouter, createWebHistory } from 'vue-router';
import Home from '../pages/Home.vue';
import Login from '../pages/Login.vue';
import Register from '../pages/Register.vue';
import Profile from '../pages/Profile.vue';
// import WhatsNew from '../pages/WhatsNew.vue';
import PlayerRegister from '../pages/PlayerRegister.vue';
import Tournaments from '../pages/Tournaments.vue';
import Admin from '../pages/Admin.vue';
// import AdminDashboard from '../pages/AdminDashboard.vue';
import ResetPassword from '../pages/ResetPassword.vue';
// import Auth from '../assets/js/auth.js';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/tournaments',
    name: 'Tournaments',
    component: Tournaments
  },
  // {
  //   path: '/whats-new',
  //   name: 'WhatsNew',
  //   component: WhatsNew
  // },
  // {
  //   path: '/notifications',
  //   name: 'Notifications',
  //   component: () => import('../pages/Notifications.vue')
  // },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: ResetPassword
  },
  {
    path: '/register-player',
    name: 'PlayerRegister',
    component: PlayerRegister
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile
  },
  // {
  //   path: '/profile',
  //   name: 'Profile',
  //   component: Profile,
  //   meta: { requiresAuth: true }
  // },
  // {
  // {
  //   path: '/tournaments/voteplayer',
  //   redirect: '/tournaments?tab=activity'
  // },
  // {
  //   path: '/admin',
  //   name: 'AdminDashboard',
  //   component: AdminDashboard,
  //   meta: { requiresAuth: true, requiresAdmin: true }
  // },
  {
    path: '/admin',
    name: 'Admin',
    component: Admin,
    meta: { requiresAdmin: true }
  },
  // Fallback redirect to Home
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Navigation Guard to restrict Admin route
router.beforeEach((to, from, next) => {
  const user = JSON.parse(localStorage.getItem('user'));
  
  if (to.meta.requiresAdmin) {
    if (user && user.role === 'admin') {
      next();
    } else {
      next('/login');
    }
  } else {
    next();
  }
});

export default router;
