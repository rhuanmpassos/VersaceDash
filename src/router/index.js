import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../store/authStore'

const Dashboard = () => import('../pages/Dashboard.vue')
const CrmBoard = () => import('../pages/CrmBoard.vue')
const Login = () => import('../pages/Login.vue')

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { 
      path: '/login', 
      name: 'Login', 
      component: Login,
      meta: { requiresGuest: true }
    },
    { 
      path: '/', 
      redirect: '/dashboard' 
    },
    { 
      path: '/dashboard', 
      name: 'Dashboard', 
      component: Dashboard,
      meta: { requiresAuth: true }
    },
    { 
      path: '/crm', 
      name: 'CRM', 
      component: CrmBoard,
      meta: { requiresAuth: true }
    },
  ],
})

// Guard de navegação
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // Se a rota requer autenticação e o usuário não está autenticado
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next('/login')
  }
  
  // Se a rota é apenas para visitantes (login) e o usuário já está autenticado
  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    return next('/dashboard')
  }
  
  next()
})

export default router

