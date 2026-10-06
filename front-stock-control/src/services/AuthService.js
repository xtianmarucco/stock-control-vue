import apiClient from './apiClient'

export const login = async (email, password) => {
  const res = await apiClient.post('/auth/login', { email, password })
  return res.data.data
}

export const logout = async () => {
  await apiClient.post('/auth/logout')
}

export const getMe = async () => {
  const res = await apiClient.get('/auth/me')
  return res.data.data
}

export const forgotPassword = async (email) => {
  await apiClient.post('/auth/forgot-password', { email })
}

export const resetPassword = async (token, password) => {
  await apiClient.post('/auth/reset-password', { token, password })
}
