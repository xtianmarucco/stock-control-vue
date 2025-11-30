// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/DashboardView.vue'

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard
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

export default router