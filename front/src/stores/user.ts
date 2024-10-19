import { defineStore } from 'pinia'
import _ from 'lodash'

export const useAdminStore = defineStore('AdminStore', {
  state: (): any => {
    return {
      user: { token: undefined }
    } as any
  },
  getters: {
    getUser(state) {
      return state.user
    }
  },
  actions: {
    saveUser(user: any) {
      console.log('saveUser', user)
      this.user = _.cloneDeep(user)
    },
    // setToken(token: string) {
    //   this.user.token = token
    // },
    updateUserPreferences(preferences: any) {
      if (this.user) {
        this.user.preferences = preferences
      }
    },
    logout() {
      console.log(`store - logout`)
      this.user = { token: undefined } as any
      this.userPaperStaging = {} as any
      let loginPageUrl = import.meta.env.VITE_APP_LOGIN_URL
      if (/\d+\.\d+\.\d+\.\d+/.test(window.location.host)) {
        loginPageUrl = window.location.origin
      }
      window.location.href = `${loginPageUrl}?title=${encodeURIComponent(
        import.meta.env.VITE_APP_LOGIN_TITLE
      )}&redirect=${window.location.href}`
    }
  },
  persist: {
    storage: sessionStorage,
    pick: ['user']
  }
})
