import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
    meta: { public: true }
  },
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/DashboardView.vue')
  },
  {
    path: '/branches',
    name: 'BranchesView',
    component: () => import('../views/BranchesView.vue')
  },
  {
    path: '/users',
    name: 'UsersView',
    component: () => import('../views/UsersView.vue')
  },
  {
    path: '/branches/:branchId/products',
    component: () => import('../layouts/ProductsLayout.vue'),
    children: [
      {
        path: '',
        name: 'BranchProducts',
        component: () => import('../views/ProductsTableView.vue'),
        props: route => ({ branchId: Number(route.params.branchId) })
      }
    ]
  },
  {
    path: '/movements',
    component: () => import('../layouts/MovementsLayout.vue'),
    children: [
      {
        path: '',
        name: 'StockMovementsView',
        component: () => import('../views/StockMovementsView.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to) => {
  if (to.meta.public) return true

  const authStore = useAuthStore()

  if (!authStore.user) {
    await authStore.fetchMe()
  }

  if (!authStore.isAuthenticated) {
    return { name: 'Login' }
  }
})

export default router
