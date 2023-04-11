<template>
  <v-container style="max-width: 900px">
    <ShowHeader :show="show" />
    <v-row>
      <v-col cols="12">
        <ActForm
          v-model="this.act"
          showComment="true"
          :showId="this.show.id"
          @name-changed="nameChanged"
        ></ActForm>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <v-btn block color="primary" elevation="2" x-large @click="save">
          SAVE
        </v-btn>
        <v-overlay :value="overlay">
          <v-progress-circular indeterminate size="64"></v-progress-circular>
        </v-overlay>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Show, Act } from "@/model/Show";
import ActForm from "../components/ActForm.vue";
import ShowHeader from "../components/ShowHeader.vue";

import { app } from "@/util/app";
import db from "../util/db";

import { Component, Vue } from "vue-property-decorator";

@Component({
  components: {
    ActForm,
    ShowHeader,
  },
})
export default class ActFormView extends Vue {
  act?: Act;
  show?: Show;
  overlay: boolean = false;

  async created() {
    const showId = this.$route.params.showId;
    const actId = this.$route.params.actId;
    await db.getShow(showId).then((s) => {
      this.show = s;
      this.show.id = showId;
      this.act = s.acts.find((a) => a.id == actId);
      this.$store.navigation = [
        { text: "trnstn", to: "/" },
        { text: "shows", to: "/shows" },
        { text: this.show.title, to: "/shows/" + this.show.id },
        { text: "guests" },
        { text: this.act?.name },
      ];
    });
  }
  save() {
    if (!this.act || !this.show) {
      return;
    }
    this.overlay = true;
    db.saveAct(this.show, this.act).then(() => {
      if (app.auth.isSignedIn()) {
        this.overlay = false;
      } else {
        this.$router.push({ name: "ThankYou", params: { id: this.show!.id! } });
      }
    });
  }
  nameChanged() {
    if (!this.act) {
      return;
    }
    const nav = this.$store.navigation;
    nav[nav.length - 1].text = this.act.name;
  }
}
</script>

<style>
</style>