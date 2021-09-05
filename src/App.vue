<template>
  <v-app>
    <v-app-bar
      app
      color="white"
      height="auto"
      style="border-bottom: 1px solid black !important; height: 44px !important;"
      
    >

      <div class="d-flex align-center" v-if="$vuetify.breakpoint.smAndUp" >
              

              <v-breadcrumbs :items="breadcrumbs" style="padding-bottom:0; padding-top: 0; max-height:22px; overflow: hidden; margin-top:auto">
    <template v-slot:item="{ item }">
      <v-breadcrumbs-item
        :to="item.to"
        :exact="true"
      >
        {{ item.text.toUpperCase() }}
      </v-breadcrumbs-item>
    </template>
  </v-breadcrumbs>
      </div>
      <div v-else style="width:120px" >
        <svg class="tr-header__middle__site-title__logo" version="1.1" id="Calque_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 760 76" style="enable-background:new 0 0 760 76;" xml:space="preserve">
          <g>
              <path d="M1,12.7h4.9c8.7,0,18.4-1,20.4-1.8l1.1,1.3c-1,1.8-1.8,3.6-1.8,9.3v52h11v-52c0-5.7-0.8-7.5-1.8-9.3l1.1-1.3
              c2,0.8,11.7,1.8,20.4,1.8H61V2H1V12.7z"></path>
              <path d="M105.42,40.9c11.1-1.3,19.8-7.3,19.8-19.4c0-12.4-8.7-19.5-21.6-19.5h-29.9v71.5h10.7V48.6c0-4.7-0.9-6.4-2-8l1.1-1.1
              c1.7,1.2,3.7,1.9,8.3,1.9h4.6l18.9,32.1h12.9l-16.1-25.1C109.52,44.3,107.82,42.5,105.42,40.9z M93.52,31.3
              c-5.7,0-8.2,0.8-10.1,1.9l-1.1-1.1c1.1-1.6,2-3.3,2-10.2s-0.9-8.6-2-10.2l1.1-1.1c1.9,1.1,4.4,1.9,10.1,1.9h9.6
              c6.8,0,11.6,3,11.6,9.4s-4.7,9.4-11.6,9.4H93.52z"></path>
              <path d="M189.8,51c0,7.7,0.8,11.8,1.8,13.8l-1.9,0.8c-1-3-11.1-29.2-34-63.6h-15.9v71.5h10.5V23.2c0-7.7-0.8-11.8-1.8-13.8l1.9-0.8
              c1,3,11,27.8,36.5,64.9h13.4V2h-10.5V51z"></path>
              <path d="M242.4,30.7c-13.3-2.2-17.8-5.1-17.8-10.6s4.5-9.1,13.5-9.1c10.3,0,15.6,4.2,17.1,12.6l9.9-3.1
              c-2.7-13.4-11.2-19.6-26.8-19.6S214.2,8.3,214.2,21c0,11,8.5,16.9,25.7,19.8c12,2,15.8,5.5,15.8,12.7c0,6.4-4.7,11.1-15.1,11.1
              c-13.1,0-17.8-6.7-18.2-14.5l-10,3.1c2,13.7,10.5,21.5,28.1,21.5c17.9,0,25.9-9.7,25.9-22.3C266.4,39.3,257.7,33.2,242.4,30.7z"></path>
              <path d="M274.69,12.7h4.9c8.7,0,18.4-1,20.4-1.8l1.1,1.3c-1,1.8-1.8,3.6-1.8,9.3v52h11v-52c0-5.7-0.8-7.5-1.8-9.3l1.1-1.3
              c2,0.8,11.7,1.8,20.4,1.8h4.7V2h-60V12.7z"></path>
              <path d="M397.7,51c0,7.7,0.8,11.8,1.8,13.8l-1.9,0.8c-1-3-11.1-29.2-34-63.6h-15.9v71.5h10.5V23.2c0-7.7-0.8-11.8-1.8-13.8l1.9-0.8
              c1,3,11,27.8,36.5,64.9h13.4V2h-10.5V51z"></path>
              <path d="M495.21,40.9c11.1-1.3,19.8-7.3,19.8-19.4c0-12.4-8.7-19.5-21.6-19.5h-29.9v71.5h10.7V48.6c0-4.7-0.9-6.4-2-8l1.1-1.1
              c1.7,1.2,3.7,1.9,8.3,1.9h4.6l18.9,32.1h12.9l-16.1-25.1C499.32,44.3,497.61,42.5,495.21,40.9z M483.31,31.3
              c-5.7,0-8.2,0.8-10.1,1.9l-1.1-1.1c1.1-1.6,2-3.3,2-10.2s-0.9-8.6-2-10.2l1.1-1.1c1.9,1.1,4.4,1.9,10.1,1.9h9.6
              c6.8,0,11.6,3,11.6,9.4s-4.7,9.4-11.6,9.4H483.31z"></path>
              <path d="M551.43,2l-26.7,71.5h11.2l7.1-19.4h29.2l7.1,19.4h11.4L564.03,2H551.43z M571.13,44.5l-0.9,1.5c-2-0.8-6.9-1.8-12.4-1.8
              c-5.5,0-10.8,1-12.8,1.8l-0.8-1.5c1.9-1.4,3.4-3.6,4.8-8.2l4.4-14.2c2.3-7.3,3.1-10.8,3.3-13.8h1.9c0.2,3,0.9,6.5,3.2,13.8
              l4.5,14.1C567.53,40.1,569.33,43.1,571.13,44.5z"></path>
              <path d="M626.7,2h-26.3v71.5h26.3c17.3,0,31.7-12.1,31.7-35.8C658.4,14,644,2,626.7,2z M625.4,63.7h-5c-5.7,0-8.1,0.7-10,1.8
              l-1.1-1.1c1.1-1.6,1.9-3.2,1.9-7.9V19.6c0-4.7-0.8-6.3-1.9-7.9l1.1-1.1c1.9,1.1,4.3,1.8,10,1.8h5c13.7,0,23,8.1,23,25.3
              S639.1,63.7,625.4,63.7z"></path>
              <path d="M681.61,2h-11.4c0,0,0.3,1.8,0.3,5.1v61.3c0,3.3-0.3,5.1-0.3,5.1h11.4c0,0-0.3-1.8-0.3-5.1V7.1
              C681.31,3.8,681.61,2,681.61,2z"></path>
              <path d="M726.21,0.5c-21.8,0-32.5,15.4-32.5,37.1c0,21.7,10.7,37.3,32.5,37.3c21.8,0,32.5-15.6,32.5-37.3
              C758.71,15.9,748.01,0.5,726.21,0.5z M726.21,64.4c-15.8,0-22.9-9.7-22.9-26.8c0-16.4,7.1-26.3,22.9-26.3
              c15.8,0,22.9,9.9,22.9,26.3C749.11,54,742.01,64.4,726.21,64.4z"></path>
          </g>
        </svg>
      </div>

      <v-spacer></v-spacer>
      <div v-if="$vuetify.breakpoint.smAndUp"> 

      <v-btn
        href="/panel"
        text
        v-if="signedIn"
      >
        <span class="mr-2">Panel</span>
        <v-icon>mdi-open-in-new</v-icon>
      </v-btn>
      </div>
      <v-app-bar-nav-icon v-else-if="signedIn" @click.stop="drawer = !drawer"></v-app-bar-nav-icon>

    </v-app-bar>

    <v-navigation-drawer
      v-model="drawer"
      absolute
      temporary
    >
      <v-list
        nav
      >
        <v-list-item v-for="item in breadcrumbs" v-bind:key="item.key" :to="item.to">
          <v-list-item-title>{{ item.text.toUpperCase() }}</v-list-item-title>
        </v-list-item>

        <v-spacer style="height: 1px; width:100%; border-top: 1px solid #DDD; margin: 1em 0;"></v-spacer>

          <v-list-item 
            href="/panel">
            <v-list-item-title>
              <span class="mr-2">Panel</span>
              <v-icon small>mdi-open-in-new</v-icon>
            </v-list-item-title>
          </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <Logo v-if="$vuetify.breakpoint.smAndUp"  />

    <v-main>
      <router-view @auth-changed="authChanged" @navigation="updateBreadcrumbs" />
    </v-main>
  </v-app>
</template>

<script>
import Logo from './components/Logo';
import { auth } from '@/util/firebase/firebase' 
import router from './router/index'
import kirby from './util/kirby'

export default {
  name: 'App',

  components: {
    Logo,
  },
  computed: {
    breadcrumbs() {
      const routes = []

      this.$store.navigation.forEach((n, i) => {
        if (typeof n == "string") {
          routes.push({ key: i, to: "/", text: n});
        } else {
          routes.push({ key: i, to: n.to, text: n.text});
        }
      })
      return routes;
    }
  },
  data: () => ({
    signedIn: auth.isSignedIn(),
    drawer: false,
  }),
  created() {
    kirby.getUser(); //.then(x => console.log(x)).then(() => kirby.getScheduledShows()).then(shows => console.log(shows));
  },
  methods: {
    authChanged() {
      const authState = auth.isSignedIn();
      this.signedIn = authState;
    },
    updateBreadcrumbs(/*bc*/) {
      // do nothing I guess...
      /*
      console.log(bc);
      console.log(this.$store.navigation);
      */
    },
    logout() {
      auth.signOut().then(() => {
          this.authChanged(); 
          router.push('/login')
      });
    },
  }
};
</script>

<style>
.v-main__wrap {
  border-top: 1px solid black;
  background-color: white;
  padding-top:2em;
}
.v-toolbar__content {
  height: 44px;
}
.container {
  max-width: 900px;
}
header .v-btn::before {
  background-color: transparent;
}
.theme--light.v-list-item--active:hover::before, .theme--light.v-list-item--active::before {
  background-color: transparent;
}
</style>