import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import { auth } from '@/util/firebase/firebase'
import router from './router'

Vue.config.productionTip = false

const store = Vue.observable({
  navigation: []
})
Vue.prototype.$store = store

let app: Vue;

auth.onAuthStateChanged(() => {
  if (!app) {
    app = new Vue({
      vuetify,
      router,
      render: h => h(App)
    }).$mount('#app');

    Vue.filter('formatDate', function(str:any) {
        if (!str) { return '(n/a)'; }
        if (str.toDate) {
          str = str.toDate();
        }
        return ((str.getDate() < 10) ? '0' : '') + str.getDate() + '.' + 
          ((str.getMonth() < 9) ? '0' : '') + (str.getMonth() + 1) + '.' +
          str.getFullYear();
    });
  }
})


