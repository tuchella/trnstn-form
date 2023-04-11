<template>
  <div class="home" >
      <v-container style="max-width:640px">
    <h1 style="font-size: 5em; text-align: center; color: grey;">THANK YOU</h1>
    <p style="text-align: center">
        That's it. Thanks for filling out the form. We'll get back to you as soon as possible.
        <br>
        If you need to make changes later on please use the link below (store it somewhere safe).
    </p>
    <div>
        <ShareLink v-model="showLink" v-if="showLink" />
        </div>
      </v-container>
  </div>
</template>

<script>
// @ is an alias to /src
import ShareLink from '@/components/ShareLink.vue'

import { Component, Vue } from "vue-property-decorator";

@Component({
  components: {
    ShareLink
  }
})
export default class ThankYou extends Vue {
  get showLink() {
      const showId = this.$route.params.id;
      if (!showId) {
        return undefined;
      }
      const route = this.$router.resolve({ name: "Show", params: { id: showId } });
      return new URL(route.href, window.location.href).href;
    }
  
}
</script>
