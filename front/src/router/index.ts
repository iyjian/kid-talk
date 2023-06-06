import { createRouter, createWebHistory } from 'vue-router'
import LetsChat from '../views/LetsChat.vue'
import Login from './../views/Login.vue'
import { AuthenticationClient } from 'authing-js-sdk'

const authClient = new AuthenticationClient({
  appId: '62315258ab0a42505a0d6bb8'
})

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/chat',
      name: 'chat',
      component: LetsChat
    },
    {
      path: '/login',
      name: 'Login',
      meta: {
        menuIgnore: true
      },
      component: Login
    }
  ]
})

const isDefinedRoute = (path: string) => {
  return router.getRoutes().map(route => route.path).filter(routePath => routePath === path).length
}

router.beforeEach(async (to, from, next) => {
  console.log(`beforeEach: to.path: ${to.path} has route: ${isDefinedRoute(to.path)}`)
  if (to.path !== '/login') {
    const user = await authClient.getCurrentUser()
    if (user?.token) {
      const { status } = await authClient.checkLoginStatus(user.token)
      if (status) {
        if (!isDefinedRoute(to.path)) {
          router.push('/login')
          next()
        } else {
          next()
        }
      } else {
        router.push('/login')
        next()
      }
    } else {
      router.push('/login')
      next()
    }
  } else {
    next()
  }
})

export default router
