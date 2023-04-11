import Vue from 'vue'
import VueRouter from 'vue-router'

import { app } from '@/util/app' 

Vue.use(VueRouter)

const routes = [
  {
    path: '/shows',
    name: 'ShowList',    
    component: () => import(/* webpackChunkName: "tschoenk" */ '../views/ShowListView.vue'),
    meta: {
      requiresAuth: true
    }
  },{
    path: '/',
    name: 'Home',
    component: () => import(/* webpackChunkName: "tschoenk" */ '../views/ShowFormView.vue'),
    meta: {
      requiresAuth: false
    }
  },{
    path: '/shows/:id/upload/redirect/',
    name: 'UploadRedirect',    
    component: () => import(/* webpackChunkName: "tschoenk" */ '../views/UploadView.vue'),
    meta: {
      requiresAuth: true
    }
  },{
    path: '/shows/:id/upload/',
    name: 'Upload',    
    component: () => import(/* webpackChunkName: "tschoenk" */ '../views/UploadView.vue'),
    meta: {
      requiresAuth: true
    }
  },{
    path: '/shows/:id/thanks',
    name: 'ThankYou',    
    component: () => import(/* webpackChunkName: "tschoenk" */ '../views/ThankYouView.vue'),
  },{
    path: '/shows/:showId/:actId/',
    name: 'Act',    
    component: () => import(/* webpackChunkName: "tschoenk" */ '../views/ActFormView.vue'),
  },{
    path: '/shows/:id/',
    name: 'Show',    
    component: () => import(/* webpackChunkName: "tschoenk" */ '../views/ShowFormView.vue'),
  },{
    path: '/login',
    name: 'Login',
    component: () => import(/* webpackChunkName: "tschoenk" */ '../views/LoginView.vue')
  },{
    path: '/test',
    name: 'TestNav',
    component: () => import(/* webpackChunkName: "tschoenk" */ '../views/TestLink.vue'),
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(x => x.meta.requiresAuth)

  if (requiresAuth && !app.auth.isSignedIn()) {
    next('/login')
  } else {
    next()
  }
})

export default router
