// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../pages/DashboardPage.vue'

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router