import { defineStore } from 'pinia'
import { getAllProducts, getProductsByCategory, getProductsWithStock } from '../services/ProductService'

export const useProductStore = defineStore('productStore', {
  state: () => ({
    products: [],
    loading: false,
    error: null
  }),

  actions: {
    async fetchAll() {
      this.loading = true
      try {
        this.products = await getAllProducts()
      } catch (err) {
        this.error = err.message
      } finally {
        this.loading = false
      }
    },

    async fetchByCategory(category) {
      this.loading = true
      try {
        this.products = await getProductsByCategory(category)
      } catch (err) {
        this.error = err.message
      } finally {
        this.loading = false
      }
    },

    async fetchWithStock() {
      this.loading = true
      try {
        this.products = await getProductsWithStock()
      } catch (err) {
        this.error = err.message
      } finally {
        this.loading = false
      }
    }
  }
})