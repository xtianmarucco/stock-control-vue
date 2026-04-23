import { defineStore } from 'pinia'
import { login as apiLogin, logout as apiLogout, getMe } from '../services/AuthService'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    loading: false
  }),

  getters: {
    isAuthenticated: (state) => !!state.user
  },

  actions: {
    async fetchMe() {
      try {
        this.user = await getMe()
      } catch {
        this.user = null
      }
    },

    async login(username, password) {
      this.loading = true
      try {
        this.user = await apiLogin(username, password)
      } finally {
        this.loading = false
      }
    },

    async logout() {
      await apiLogout()
      this.user = null
    }
  }
})
