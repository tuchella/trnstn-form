import Vue from 'vue'
import VueRouter from 'vue-router'
import { auth } from '@/util/firebase/firebase'

Vue.use(VueRouter)

const routes = [
  {
    path: '/shows',
    name: 'ShowList',    
    component: () => import(/* webpackChunkName: "tschoenk" */ '../views/Shows.vue'),
    meta: {
      requiresAuth: true
    }
  },{
    path: '/',
    name: 'Home',
    component: () => import(/* webpackChunkName: "tschoenk" */ '../views/ShowForm.vue'),
    meta: {
      requiresAuth: false
    }
  },{
    path: '/shows/:id/upload/redirect/',
    name: 'UploadRedirect',    
    component: () => import(/* webpackChunkName: "tschoenk" */ '../views/Upload.vue'),
    meta: {
      requiresAuth: true
    }
  },{
    path: '/shows/:id/upload/',
    name: 'Upload',    
    component: () => import(/* webpackChunkName: "tschoenk" */ '../views/Upload.vue'),
    meta: {
      requiresAuth: true
    }
  },{
    path: '/shows/:showId/:actId/',
    name: 'Act',    
    component: () => import(/* webpackChunkName: "tschoenk" */ '../views/ActFormView.vue'),
  },{
    path: '/shows/:id/',
    name: 'Show',    
    component: () => import(/* webpackChunkName: "tschoenk" */ '../views/ShowForm.vue'),
  },{
    path: '/login',
    name: 'Login',
    component: () => import(/* webpackChunkName: "tschoenk" */ '../views/Login.vue')
  },{
    path: '/thanks',
    name: 'ThankYou',    
    component: () => import(/* webpackChunkName: "tschoenk" */ '../views/ThankYou.vue'),
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(x => x.meta.requiresAuth)

  if (requiresAuth && !auth.isSignedIn()) {
    next('/login')
  } else {
    next()
  }
})

export default router
