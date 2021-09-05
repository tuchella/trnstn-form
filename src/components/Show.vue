<template>
  <div>
    <v-form ref="form" lazy-validation>
      <v-container style="max-width: 900px">
        <!-- SHOW TITLE -->
        <v-row>
          <v-col cols="12">
            <v-autocomplete
              class="large-input"
              height="61px"
              style="font-size:50px"
              :readonly="show.id != undefined"
              :items="residencies"
              item-text="title"
              item-value="title"
              placeholder="select your show"
              required
              append-icon=""
              return-object
              v-model="selectedShow"
              @input="showSelected"
            ></v-autocomplete>
          </v-col>
          <!--
          <v-col cols="3" sm="2">
            <v-text-field 
                style="margin-top:1px"
                class="large-input"
                prefix="#"
                v-model="show.number"
                @input="titleChanged"
            ></v-text-field>
          </v-col>
          -->
        </v-row>
        <!-- DATE/TIME INPUTS -->
        <v-row >
          <v-col cols="12" sm="8">
            <DatePicker v-model="show.date" :readonly="true" />
          </v-col>
          <v-col cols="6" sm="2">
            <v-text-field
              label="Start"
              type="time"
              readonly
              disabled
              v-model="show.timeStart"
            ></v-text-field>
          </v-col>
          <v-col cols="6" sm="2">
            <v-text-field
              label="End"
              type="time"
              readonly
              disabled
              v-model="show.timeEnd"
            ></v-text-field>
          </v-col>
        </v-row>
        <!-- INFO EDIT BOX -->
        <v-row v-if="isSignedIn">
          <v-col cols="12">
            <v-textarea v-model="info" outlined />
          </v-col>
        </v-row>

        <!-- VIEW FOR NON LOGGED IN USERS -->
        <v-row v-if="!isSignedIn">
          <v-col cols="12">
            <InfoBox v-model="info" />
          </v-col>
        </v-row>

        <!-- ACTS -->
        <v-row>
          <v-col
            cols="12"
            v-for="(act, i) in show.acts"
            v-bind:key="i"
            class="mb-2"
          >
            <ActForm
              v-model="show.acts[i]"
              @remove="removeAct(i)"
              v-bind:removable="i > 0"
              :showComment="isSignedIn"
              :showId="show.id"
            />
          </v-col>
          <v-col cols="12">
            <span v-if="show.acts.length == 0" class="text-caption">
              No acts. Add with button to the right.
            </span>

            <v-btn large color="primary" @click="addAct" class="float-right">
              Add act
              <v-icon style="margin-top: -4px" right dark>mdi-plus-circle-outline</v-icon>
            </v-btn>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12">
            <!-- CONTACT -->
            <v-text-field label="Contact" v-model="show.contact"></v-text-field>
            <!-- TAGS -->
            <v-autocomplete
              label="Tags"
              :items="allTags"
              :search-input.sync="tagSearch"
              v-model="show.tags"
              @change="tagSearch = ''"
              auto-select-first
              chips
              deletable-chips
              multiple
            ></v-autocomplete>
            <!-- COMMENTS -->
            <v-textarea
              counter
              label="Comments/Remarks"
              v-model="show.comment"
            ></v-textarea>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12">
            <ShareLink v-model="link" v-if="isSignedIn && show.id" />
            <span v-else-if="isSignedIn" class="green--text text--lighten-2">
              Please save this show to generate share link.
            </span>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12">
            <v-btn
              block
              color="primary"
              elevation="2"
              large
              :disabled="!show.title"
              @click="save"
            >
              SAVE
            </v-btn>
          </v-col>
        </v-row>
      </v-container>

      <v-overlay :value="overlay">
        <v-progress-circular indeterminate size="64"></v-progress-circular>
      </v-overlay>
    </v-form>
  </div>
</template>

<script>
import ActForm from "./ActForm.vue";
import DatePicker from "./DatePicker.vue";
import InfoBox from "./InfoBox.vue";
import ShareLink from "./ShareLink.vue";

import { auth } from "@/util/firebase/firebase";
import db from "../util/db";
import uuid from "../util/uuid";
import { tags } from "../util/enums";
import kirby from "../util/kirby";
import * as t from '@/util/types';


export default {
  props: ["id", "actId"],
  components: { ActForm, DatePicker, InfoBox, ShareLink },
  name: "Show",
  computed: {
    isSignedIn() {
      return auth.isSignedIn();
    },
    link() {
      const id = this.show.id;
      return `${window.location.protocol}//${window.location.host}/shows/${id}`;
    },
  },
  methods: {
    addAct() {
      this.show.acts.push(new t.Act(uuid(), ""));
    },
    save() {
      const valid = this.$refs.form.validate()
      if (!valid) {
        return;
      }

      this.overlay = true;
      db.saveShow(this.show).then(() => {
        if (this.isSignedIn) {
          this.overlay = false;
        } else {
          this.$router.push({ name: "ThankYou" });
        }
      });
      if (this.isSignedIn) {
        db.saveInfo(this.info);
      }
    },
    removeAct(g) {
      this.show.acts.splice(g, 1);
    },
    showSelected(sel) {
      this.show.title = sel.title;
      this.show.date = sel.date;
      this.show.timeStart = sel.timeStart;
      this.show.timeEnd = sel.timeEnd;
      this.show.residency = sel.residency;
      const nav = this.$store.navigation;
      nav[nav.length - 1].text = this.show.title;
    },
    titleChanged() {
      if (!/^[0-9]*$/.test(this.show.number)) {
        this.$nextTick(() => {
          this.show.number = this.show.number.replace(/\D/g,'');
        });
      } else {
        const nav = this.$store.navigation;
        nav[nav.length - 1].text = this.show.title;
      }

    },
  },
  mounted() {
    if (this.id) {
      db.getShow(this.id).then((data) => {
        this.show = data;
        if (this.show.acts.length == 0) {
          this.addAct();
        }
        console.log(this.show.date)
        this.residencies = [ this.show ];
        this.selectedShow = this.show;
        this.$store.navigation = [
          { text: "trnstn", to: "/" },
          { text: "shows", to: "/shows" },
          { text: this.show.title },
        ];
      });
    } else {
      this.show = new t.Show()
      this.addAct();
      this.$store.navigation = [
        { text: "trnstn", to: "/" },
        { text: "shows", to: "/shows" },
        { text: "new show" },
      ];
      kirby.getScheduledShows().then(shows => {
        this.residencies = shows;
      })
    }
    db.getInfo().then((info) => (this.info = info));
    
  },

  data: () => ({
    show: new t.Show(),
    selectedShow: {
      title: ""
    },
    residencies: [],
    info: "",
    emailRules: [
      (v) => !!v || "E-mail is required",
      (v) => /.+@.+\..+/.test(v) || "E-mail must be valid",
    ],
    overlay: false,
    date: new Date().toISOString().substr(0, 10),
    menu: false,
    allTags: tags,
    tagSearch: "",
  }),
};
</script>


<style>
body main .theme--light.v-chip {
  background: transparent !important;
  border: 1px solid black;
  border-radius: 6px;
  text-transform: uppercase;
}
body main .theme--light.v-chip:hover {
  background: black !important;
  color: white;
}
body main .theme--light.v-chip:hover .v-icon {
  color: white;
}
.large-input {
  font-family: AA-Gothic;
  font-weight: normal;
  font-size: 50px;
  line-height: 45px;
}
.large-input.v-input input {
  max-height: 64px;
}
.large-input.v-input .v-input__prepend-inner, 
.large-input.v-input .v-input__append-inner {
  margin-top: 20px;
}

h2 {
  color: blue;
}
</style>