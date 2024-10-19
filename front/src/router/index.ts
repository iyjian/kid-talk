import { createRouter, createWebHistory } from 'vue-router'
import LetsChat from '../views/LetsChat.vue'
import PhraseStudy from './../views/PhraseStudy.vue'
import PhraseAudio from './../views/PhraseAudio.vue'
import SpeechTest from './../views/SpeechTest.vue'
import Test from './../views/Test.vue'
import { useAdminStore } from '@/stores/user'
import { apiClient } from '@/libs/api'
import _ from 'lodash'

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
      path: '/',
      name: 'phraseAudio',
      component: PhraseAudio
    },
    {
      path: '/speechTest',
      name: 'SpeechTest',
      component: SpeechTest
    },
    {
      path: '/test',
      name: 'Test',
      component: Test
    }
  ]
})

const isDefinedRoute = (path: string) => {
  return router
    .getRoutes()
    .map((route) => route.path)
    .filter((routePath) => routePath === path).length
}

router.beforeEach(async (to, from, next) => {
  const adminStore = useAdminStore()
  console.log(`beforeEach - routePath: ${to.path} isDefined: ${isDefinedRoute(to.path)}`)

  if (!isDefinedRoute(to.path)) {
    // 未定义路由，跳转到404页面
    let loginPageUrl = import.meta.env.VITE_APP_LOGIN_URL
    if (/\d+\.\d+\.\d+\.\d+/.test(window.location.host)) {
      loginPageUrl = window.location.origin
    }
    window.location.href = `${loginPageUrl}?title=${encodeURIComponent(
      import.meta.env.VITE_APP_LOGIN_TITLE
    )}&redirect=${window.location.href}`
    return
  }

  if (to.path === '/phraseAudio') {
    next()
    return
  }
  // http://localhost:49893/?skipBind=1&redirect=http://localhost:5174/admin-panel
  const token = adminStore?.user.token || to.query.token

  if (token) {
    // 登录地址有token，说明是从单点登录页跳转来的，则用token检查用户状态
    try {
      const userDetail = await apiClient.getUserDetail(token)
      const {id, isAdmin, userName, permissions, roles} = userDetail.data.data
      console.log(`router - beforeEach - token: ${token}`)
      adminStore.saveUser({
        id,
        isAdmin,
        token,
        userName,
        permissions,
        roles: _.keyBy(roles, (o) => o['enName']),
      })
      next()
    } catch (e) {
      console.log(e)
      let loginPageUrl = import.meta.env.VITE_APP_LOGIN_URL

      if (/\d+\.\d+\.\d+\.\d+/.test(window.location.host)) {
        loginPageUrl = window.location.origin
      }

      // window.location.href = `${loginPageUrl}?title=${encodeURIComponent(
      //   import.meta.env.VITE_APP_LOGIN_TITLE
      // )}&redirect=${window.location.href}`

      return
    }
  } else {
    console.log('router - beforeEach - no token')
    let loginPageUrl = import.meta.env.VITE_APP_LOGIN_URL
    if (/\d+\.\d+\.\d+\.\d+/.test(window.location.host)) {
      loginPageUrl = window.location.origin
    }
    // window.location.href = `${loginPageUrl}?title=${encodeURIComponent(
    //   import.meta.env.VITE_APP_LOGIN_TITLE
    // )}&redirect=${window.location.href}`

    return
  }
})

export default router
