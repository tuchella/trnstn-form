<template>
  <v-container style="max-width: 400px; margin-top: 20vh;">
    <v-form @submit.prevent="login">
    <v-row>
      <v-col cols="12">
        <v-text-field label="email" v-model="username"></v-text-field>
        <v-text-field
          v-model="password"
          label="password"
          :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
          :type="showPassword ? 'text' : 'password'"
          @click:append="showPassword = !showPassword"
        ></v-text-field>
      </v-col>
      <v-col cols="12">
        <v-btn block color="primary" large type="submit">Login</v-btn>
      </v-col>
    </v-row>
    </v-form>

    <v-snackbar v-model="showNotification" timeout="10000" color="red darken-2">
      {{ notification }}

      <template v-slot:action="{ attrs }">
        <v-btn
          color="read"
          text
          v-bind="attrs"
          @click="showNotification = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script lang="ts">
import { app } from "@/util/app";
import router from "../router/index";

import { Component, Vue } from "vue-property-decorator";

@Component
export default class LoginView extends Vue {
    password:string= "";
    username:string = "";
    showPassword:boolean = false;
    showNotification:boolean= false;
    notification:string= "";
    unsubscribe?:()=>void = undefined;
  
  mounted() {
    this.$store.navigation = [
          { text: 'trnstn', to: '/'}, 
          { text: 'login'}
    ]
    this.unsubscribe = app.auth.onAuthStateChanged(() => {
      if (app.auth.isSignedIn()) {
            router.push('/shows')
      }
    });
  }
  unmounted() {
    if (this.unsubscribe) {
      this.unsubscribe()
    }
  }
  /*
  
  watch: {
    notification: function(val) {
      if (val) {
        this.showNotification = true;
      }
    }
  },*/
    login() {
      app.auth.signIn(this.username, this.password)
        .then(() => {
          router.push("/");
          this.$emit('auth-changed')
        })
        .catch((e) => {
          this.notification = e.message || e; 
          this.showNotification = true;
        });
    }
}
</script>

<style>
</style>