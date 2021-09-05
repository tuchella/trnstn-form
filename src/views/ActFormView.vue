<template>
  <v-container style="max-width: 900px">
    <ShowHeader :show="show" />
    <v-row>
        <v-col cols="12">
            <ActForm v-model="this.act" 
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
                <v-progress-circular
                    indeterminate
                    size="64"
                ></v-progress-circular>
            </v-overlay>
          </v-col>
        </v-row>
  </v-container>
</template>

<script>
import { auth } from "@/util/firebase/firebase";
import db from "../util/db";
import ActForm from "../components/ActForm.vue";
import ShowHeader from "../components/ShowHeader.vue";

export default {
  components: {
    ActForm, 
    ShowHeader
  },
  data: () => ({
    act: {},
    show: {},
    overlay: false,
  }),
  async created() {
    const showId = this.$route.params.showId;
    const actId = this.$route.params.actId;
    await db.getShow(showId).then((s) => {
      this.show = s;
      this.show.id = showId;
      this.act = s.acts.find((a) => a.id == actId);
      this.$store.navigation = [
          { text: 'trnstn', to: '/'}, 
          { text: 'shows', to: '/shows'},
          { text: this.show.title + ' #' + this.show.number, to: '/shows/' + this.show.id},
          { text: "guests"},
          { text: this.act.name}
        ];
    });
  },
  methods: {
      save() {
          this.overlay = true;
          db.saveAct(this.show, this.act).then(() => {
            if (auth.isSignedIn()) {
              this.overlay = false;
            } else {
              this.$router.push({ name: 'ThankYou' });
            }
          });
      },
      nameChanged() {
        const nav = this.$store.navigation;
        nav[nav.length -1].text = this.act.name;
      }
  },
};
</script>

<style>
</style>