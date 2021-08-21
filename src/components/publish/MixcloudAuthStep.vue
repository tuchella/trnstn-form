<template>
  <v-card max-width="300px">
    <v-card-title class="text-h5"> Login required </v-card-title>

    <v-card-text>
      You must be logged in to MixCloud and have authorized this app to upload
      files.
      <br />
      Please click below to login.
      <br />
      If something goes wrong try to
      <a color="red--txt text--darken-1" @click="logout"> LOGOUT </a> and back
      in again.

      <img
        style="width: 100%; padding: 2em; padding-bottom: 0"
        src="@/../public/Mixcloud_logo_2020.svg"
      />
    </v-card-text>

    <v-card-actions>
      <v-btn color="green darken-1" text block @click="login"> LOGIN </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">

import { Component, Vue } from "vue-property-decorator";
import { MIXCLOUD_CLIENT_SECRET, MIXCLOUD_CLIENT_ID } from "@/util/keys"

@Component
export default class MixcloudAuthStep extends Vue {
  key?: string = undefined;

  async mounted() {
    const code = this.$route.query.code;
    if (localStorage.mixcloudAccessToken) {
      const url = `https://api.mixcloud.com/me/?access_token=${localStorage.mixcloudAccessToken}`;
      const response = await fetch(url);
      console.log(response);
      if (response.ok) {
        this.$emit("auth-success");
        return;
      } else {
        localStorage.removeItem("mixcloudAccessToken");
      }
    }
    if (code) {
      const url =
        `https://www.mixcloud.com/oauth/access_token?` + 
        `client_id=${MIXCLOUD_CLIENT_ID}` +
        `&redirect_uri=${this.redirectUrl}` +
        `&client_secret=${MIXCLOUD_CLIENT_SECRET}&code=${code}`;
      const response = await fetch(url);
      if (response.ok) {
        const json = await response.text();
        const accessToken = JSON.parse(json).access_token;
        localStorage.mixcloudAccessToken = accessToken;
        this.$emit("auth-success");
      }
    }
  }
  get redirectUrl() {
      const location = window.location;
      let url = location.protocol + '//' + location.host + location.pathname;
      if (url.endsWith('/redirect') || url.endsWith('/redirect/')) {
          return url;
      }
      if (!url.endsWith('/')) {
          url += '/';
      }
      return url + 'redirect';
  }
  logout() {
    localStorage.removeItem("mixcloudAccessToken");
    this.login();
  }
  login() {
    const redirectUri = `${this.redirectUrl}`;
    const url =
      `https://www.mixcloud.com/oauth/authorize?client_id=${MIXCLOUD_CLIENT_ID}` +
      `&redirect_uri=${redirectUri}`;

    window.location.href = url;
  }
}
</script>

<style>
</style>