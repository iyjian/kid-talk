import { createRouter, createWebHistory } from 'vue-router'
import LetsChat from '../views/LetsChat.vue'
import Login from './../views/Login.vue'
import PhraseStudy from './../views/PhraseStudy.vue'
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
      path: '/phraseStudy',
      name: 'phraseStudy',
      component: PhraseStudy
    },
    {
      path: '/login',
      name: 'login',
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
  console.log(`beforeEach - routePath: ${to.path} isDefined: ${isDefinedRoute(to.path)}`)

  if (to.path === '/login') {
    next()
    return
  }
  
  const user = await authClient.getCurrentUser()
  
  if (!user?.token) {
    router.push('/login')
    next()
    return
  }
  
  const { status } = await authClient.checkLoginStatus(user.token)
  
  if (status && isDefinedRoute(to.path)) {
    // 如果已登录或者是有定义的路由，则渲染页面
    next()
  } else {
    // 否则进入登录页
    router.push('/login')
    next()
  }
})

export default router
