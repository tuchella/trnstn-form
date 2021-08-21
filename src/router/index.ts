import Vue from 'vue'
import VueRouter from 'vue-router'
import { auth } from '../firebase'

Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/shows' 
  },{
    path: '/shows',
    name: 'ShowList',    
    component: () => import(/* webpackChunkName: "about" */ '../views/Shows.vue'),
    meta: {
      requiresAuth: true
    }
  },{
    path: '/shows/create',
    name: 'Home',
    component: () => import(/* webpackChunkName: "about" */ '../views/ShowForm.vue'),
    meta: {
      requiresAuth: false
    }
  },{
    path: '/shows/:id/upload/redirect/',
    name: 'UploadRedirect',    
    component: () => import(/* webpackChunkName: "about" */ '../views/Upload.vue'),
    meta: {
      requiresAuth: true
    }
  },{
    path: '/shows/:id/upload/',
    name: 'Upload',    
    component: () => import(/* webpackChunkName: "about" */ '../views/Upload.vue'),
    meta: {
      requiresAuth: true
    }
  },{
    path: '/shows/:showId/:actId/',
    name: 'Act',    
    component: () => import(/* webpackChunkName: "about" */ '../views/ActFormView.vue'),
  },{
    path: '/shows/:id/',
    name: 'Show',    
    component: () => import(/* webpackChunkName: "about" */ '../views/ShowForm.vue'),
  },{
    path: '/login',
    name: 'Login',
    component: () => import(/* webpackChunkName: "about" */ '../views/Login.vue')
  },{
    path: '/thanks',
    name: 'ThankYou',    
    component: () => import(/* webpackChunkName: "about" */ '../views/ThankYou.vue'),
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(x => x.meta.requiresAuth)

  if (requiresAuth && !auth.currentUser) {
    next('/login')
  } else {
    next()
  }
})

export default router
