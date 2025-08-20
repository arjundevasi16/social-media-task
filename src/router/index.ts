import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/views/LoginPage.vue'
import Signup from '@/views/SignUpPage.vue'
import { useAuth } from '@/stores/useAuth'
import HomePage from '@/views/homePage.vue'

const routes = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
  },
  {
    path: '/signup',
    name: 'Signup',
    component: Signup,
  },
  {
    path: '/home',
    name: 'home',
    component: HomePage,
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})
router.beforeEach((to, from, next) => {
  const store = useAuth()
  if (to.meta.requiresAuth && !store.isAuthenticated) {
    next('/login')
  } else if ((to.path === '/login' || to.path === '/signup') && store.isAuthenticated) {
    next('/home')
  } else {
    next()
  }
})

export default router
