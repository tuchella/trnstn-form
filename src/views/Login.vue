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

<script>
import { auth } from "@/util/firebase/firebase";
import router from "../router/index";

export default {
  data: () => ({
    password: "",
    username: "",
    showPassword: false,
    showNotification: false,
    notification: "",
    unsubscribe: undefined,
  }),
  mounted() {
    this.$store.navigation = [
          { text: 'trnstn', to: '/'}, 
          { text: 'login'}
    ]
    this.unsubscribe = auth.onAuthStateChanged(() => {
      if (auth.isSignedIn()) {
            router.push('/shows')
      }
    });
  },
  unmounted() {
    if (this.unsubscribe) {
      this.unsubscribe()
    }
  },
  /*
  
  watch: {
    notification: function(val) {
      if (val) {
        this.showNotification = true;
      }
    }
  },*/
  methods: {
    login() {
      auth.signIn(this.username, this.password)
        .then(() => {
          router.push("/");
          this.$emit('auth-changed')
        })
        .catch((e) => {
          this.notification = e.message; 
          this.showNotification = true;
        });
    },
  },
};
</script>

<style>
</style>