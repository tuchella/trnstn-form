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
              style="font-size: 50px"
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
            >
              <template v-slot:item="data">
                <v-list-item-content
                  v-text="formatTitle(data.item)"
                ></v-list-item-content>
              </template>
            </v-autocomplete>
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
        <v-row>
          <v-col cols="12" sm="8">
            <DatePicker v-model="show.date" :readonly="true" />
          </v-col>
          <v-col cols="6" sm="2">
            <v-text-field
              label="Start"
              type="time"
              readonly
              tabindex="-1"
              aria-disabled="true"
              disabled
              v-model="show.timeStart"
            ></v-text-field>
          </v-col>
          <v-col cols="6" sm="2">
            <v-text-field
              label="End"
              type="time"
              aria-disabled
              tabindex="-1"
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
              Add guest
              <v-icon style="margin-top: -4px" right dark
                >mdi-account-plus-outline</v-icon
              >
            </v-btn>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="12">
            <!-- CONTACT -->
            <v-text-field
              label="Contact (E-Mail) *"
              :rules="requiredField"
              v-model="show.contact.email.value"
            ></v-text-field>
            <!-- PHONE -->
            <v-text-field
              label="Contact (Phone)"
              v-model="show.contact.phone.value"
            ></v-text-field>
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

<script lang="ts">
import ActForm from "./ActForm.vue";
import DatePicker from "./DatePicker.vue";
import InfoBox from "./InfoBox.vue";
import ShareLink from "./ShareLink.vue";

import { Act, ScheduledShow, Show } from "@/model/Show";

import { app } from "@/util/app";
import { dateToString } from "@/util/date";
import db from "@/util/db";
import kirby from "@/util/kirby";
import uuid from "@/util/uuid";

import { Component, Vue, Prop } from "vue-property-decorator";

type VForm = Vue & { validate: () => boolean };
interface ShowSelection { title: string }

@Component({
  components: {
    ActForm,
    DatePicker,
    InfoBox,
    ShareLink,
  },
})
export default class ShowForm extends Vue {
  @Prop({ required: false }) id?: string;

  show: Show = new Show();
  selectedShow: ShowSelection = { title: "" };
  residencies: ScheduledShow[] = [];
  info: string = "";
  emailRules = [
    (v?: string) => !!v || "E-mail is required",
    (v?: string) => (v && /.+@.+\..+/.test(v)) || "E-mail must be valid",
  ];
  requiredField = [(v?: string) => !!v || "This field is required"];
  overlay = false;
  
  get isSignedIn() {
    return app.auth.isSignedIn();
  }
  get link() {
    const id = this.show.id;
    return `${window.location.protocol}//${window.location.host}/form/shows/${id}`;
  }
  get form(): VForm {
    return this.$refs.form as Vue & { validate: () => boolean };
  }

  mounted() {
    if (this.id) {
      db.getShow(this.id).then((data) => {
        this.show = data;
        if (this.show.acts.length == 0) {
          this.addAct();
        }
        this.residencies = [this.show];
        this.selectedShow = this.show;
        this.$store.navigation = [
          { text: "trnstn", to: "/" },
          { text: "shows", to: "/shows" },
          { text: this.show.title },
        ];
      });
    } else {
      this.show = new Show();
      this.addAct();
      this.$store.navigation = [
        { text: "trnstn", to: "/" },
        { text: "shows", to: "/shows" },
        { text: "new show" },
      ];
      kirby.getScheduledShows().then((shows) => {
        this.residencies = shows;
      });
    }
    db.getInfo().then((info) => (this.info = info));
  }

  formatTitle(item: Show) {
    return `${item.title} (${dateToString(item.date)})`;
  }

  addAct() {
    this.show.acts.push(new Act(uuid(), ""));
  }

  save() {
    const valid = this.form.validate();
    if (!valid) {
      this.$nextTick(() => {
        const el = this.$el.querySelector(".v-messages.error--text");
        el?.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "center",
        });
      });
      return;
    }

    this.overlay = true;
    db.saveShow(this.show).then(() => {
      if (this.isSignedIn) {
        this.overlay = false;
      } else {
        this.$router.push({ name: "ThankYou", params: { id: this.show.id! } });
      }
    });
    if (this.isSignedIn) {
      db.saveInfo(this.info);
    }
  }
  removeAct(g: number) {
    this.show.acts.splice(g, 1);
  }
  showSelected(sel: ScheduledShow) {
    this.show.title = sel.title;
    this.show.date = sel.date;
    this.show.timeStart = sel.timeStart;
    this.show.timeEnd = sel.timeEnd;
    this.show.residency = sel.residency;
    this.show.eventRef = sel.eventRef;
    const nav = this.$store.navigation;
    nav[nav.length - 1].text = this.show.title;
  }
  titleChanged() {
    if (!/^[0-9]*$/.test(this.show.number)) {
      this.$nextTick(() => {
        this.show.number = this.show.number.replace(/\D/g, "");
      });
    } else {
      const nav = this.$store.navigation;
      nav[nav.length - 1].text = this.show.title;
    }
  }
}
</script>


<style>
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
</style>
