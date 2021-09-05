import Vue from 'vue'
import VueRouter from 'vue-router'
import { auth } from '@/util/firebase/firebase'

Vue.use(VueRouter)

const routes = [
  {
    path: '/shows',
    name: 'ShowList',    
    component: () => import(/* webpackChunkName: "int" */ '../views/Shows.vue'),
    meta: {
      requiresAuth: true
    }
  },{
    path: '/',
    name: 'Home',
    component: () => import(/* webpackChunkName: "pub" */ '../views/ShowForm.vue'),
    meta: {
      requiresAuth: false
    }
  },{
    path: '/shows/:id/upload/redirect/',
    name: 'UploadRedirect',    
    component: () => import(/* webpackChunkName: "int" */ '../views/Upload.vue'),
    meta: {
      requiresAuth: true
    }
  },{
    path: '/shows/:id/upload/',
    name: 'Upload',    
    component: () => import(/* webpackChunkName: "int" */ '../views/Upload.vue'),
    meta: {
      requiresAuth: true
    }
  },{
    path: '/shows/:showId/:actId/',
    name: 'Act',    
    component: () => import(/* webpackChunkName: "act" */ '../views/ActFormView.vue'),
  },{
    path: '/shows/:id/',
    name: 'Show',    
    component: () => import(/* webpackChunkName: "pub" */ '../views/ShowForm.vue'),
  },{
    path: '/login',
    name: 'Login',
    component: () => import(/* webpackChunkName: "int" */ '../views/Login.vue')
  },{
    path: '/thanks',
    name: 'ThankYou',    
    component: () => import(/* webpackChunkName: "pub" */ '../views/ThankYou.vue'),
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
