import { create } from 'zustand'

const TOKEN_KEY = 'fleetos_token'
const USER_KEY  = 'fleetos_user'

export const useAuthStore = create((set, get) => ({
  token: localStorage.getItem(TOKEN_KEY) || null,
  user:  JSON.parse(localStorage.getItem(USER_KEY) || 'null'),

  setAuth: (token, user) => {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    set({ token, user })
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    set({ token: null, user: null })
  },

  isAuthenticated: () => !!get().token,

  hasRole: (...roles) => {
    const user = get().user
    return user && roles.includes(user.role)
  },

  isAdmin: () => {
    const user = get().user
    return user && ['ADMIN', 'SUPER_ADMIN'].includes(user.role)
  },
}))
