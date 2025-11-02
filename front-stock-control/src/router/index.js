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
  path: '/products',
  
  component: () => import('../layouts/ProductsLayout.vue'),
  children: [
    {
      path: '',
      name: 'ProductsTableView',
      component: () => import('../views/ProductsTableView.vue')
    }
  ]
}
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router