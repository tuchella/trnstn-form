<template>
  <v-container class="upload-form" style="max-width: 900px">
    <v-stepper v-model="currentStep">
      <v-stepper-header>
        <v-stepper-step :complete="currentStep > 1" step="1"> Authorize </v-stepper-step>
        <v-divider></v-divider>
        <v-stepper-step :complete="currentStep > 2" step="2">Upload to Mixcloud</v-stepper-step>
        <v-divider></v-divider>
        <v-stepper-step step="3"> Publish to Website </v-stepper-step>
        <v-divider></v-divider>
        <v-stepper-step step="4"> Clean up data </v-stepper-step>
      </v-stepper-header>

      <v-stepper-items>
        <v-stepper-content step="1">
          <MixcloudAuthStep @auth-success="continueAfterMixcloudLogin"></MixcloudAuthStep>

          <div class="upload-form__ctls">
            <v-btn text> Cancel </v-btn>

            <v-btn color="primary" @click="currentStep = 2"> Continue </v-btn>
          </div>
        </v-stepper-content>

        <v-stepper-content step="2">
          <v-row>
            <v-col cols="12" sm="8" md="9">
              <h1
                style="
                  font-family: AA-Gothic;
                  font-weight: normal;
                  font-size: 50px;
                  line-height: 45px;
                "
              >
                {{ show.title }} #{{ show.number }}
                <br />
                {{ show.description }}
              </h1>
            </v-col>
            <v-col cols="12" sm="4" md="3" class="text-right">
              <span style="font-size: 25px; line-height: 20px">
                12.01.2020 10:00-18:00
              </span>
            </v-col>
          </v-row>
          <v-row v-for="r in show.rappers" :key="r.act.id">
            <v-col cols="12" sm="3">
              <ArtworkUpload v-model="r.act" />
            </v-col>
            <v-col cols="12" sm="9">
              <v-row>
                <v-col cols="12">
                  <span style="font-size: 1.5em">
                    {{ show.title }} #{{ show.number }} /w {{ r.act.name }} ({{
                      show.createdAt | formatDate
                    }})
                  </span>
                  <div style="color: gray">
                    <span v-for="tag in show.tags" :key="tag">
                      #{{ tag }}
                    </span>
                  </div>
                </v-col>
              </v-row>
              <FileUpload v-model="r.act.file" v-if="!r.act.link" />
              <a
                v-else
                :href="r.act.link"
                target="_blank"
                class="green--text text-darken-1"
                style="font-size: 2em"
                >{{ r.act.link }}</a
              >
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <v-progress-linear
                v-if="uploading"
                indeterminate
                color="green"
              ></v-progress-linear>
              <v-alert type="error" v-if="errorMessage">
                {{ errorMessage }}
              </v-alert>
            </v-col>

            <v-col cols="12" style="display: flex">
              <v-spacer></v-spacer>
              <v-btn
                color="primary"
                elevation="2"
                large
                @click="upload"
                style="margin: 1em"
                :disabled="uploading"
              >
                SAVE
              </v-btn>
            </v-col>

            <v-overlay :value="overlay">
              <v-progress-circular
                indeterminate
                size="64"
              ></v-progress-circular>
            </v-overlay>
          </v-row>

          <v-dialog v-model="dialog" max-width="290">
            <v-card>
              <v-card-title class="text-h5"> Login required </v-card-title>

              <v-card-text>
                You must be logged in to MixCloud and have authorized this app
                to upload files.
                <br />
                Please click below to login.
              </v-card-text>

              <v-card-actions> </v-card-actions>
            </v-card>
          </v-dialog>

          <div class="upload-form__ctls">
            <v-btn text @click="currentStep--"> Back </v-btn>

            <v-btn color="primary" @click="currentStep++"> Continue </v-btn>
          </div>
        </v-stepper-content>

        <v-stepper-content step="3">
          <PublishToCmsStep v-model="show" :show="show" />

          <div class="upload-form__ctls">
            <v-btn text @click="currentStep--"> Back </v-btn>

            <v-btn color="primary" @click="currentStep++"> Continue </v-btn>
          </div>
        </v-stepper-content>

        <v-stepper-content step="4">
          <v-card max-width="500px">
            <v-card-title class="text-h5"> Tidy up! </v-card-title>

            <v-card-text>
              <p>
                Storage costs money. Traffic costs money. Everything costs
                money.
              </p>
              <p>We don't have money.</p>
              <p>
                To save money please clean up after yourselves and delete
                outdated data by click the button below.
              </p>
              <p>
                Note: this will remove all files related to this show. Make sure
                everything was transfered to the CMS correctly beforehand. No
                refunds.
              </p>
            </v-card-text>

            <v-card-actions>
              <v-btn color="red" block> Delete Show Data </v-btn>
            </v-card-actions>
          </v-card>

          <div class="upload-form__ctls">
            <v-btn text @click="currentStep--"> Back </v-btn>

            <v-btn color="primary" @click="currentStep = 1"> Close </v-btn>
          </div>
        </v-stepper-content>
      </v-stepper-items>
    </v-stepper>
  </v-container>
</template>

<script lang="ts">
import db from "../util/db";
import ArtworkUpload from "../components/ArtworkUpload.vue";
import FileUpload from "../components/FileUpload.vue";
import PublishToCmsStep from "../components/publish/PublishToCmsStep.vue";
import MixcloudAuthStep from "@/components/publish/MixcloudAuthStep.vue";

import { Component, Vue } from "vue-property-decorator";
import { Show } from "@/util/types";

@Component({
  components: {
    ArtworkUpload,
    FileUpload,
    PublishToCmsStep,
    MixcloudAuthStep,
  },
})
export default class Upload extends Vue {
  currentStep: number = 1;
  show: Show = new Show();
  overlay: boolean = false;
  key?: string = undefined;
  dialog: boolean = false;
  uploading: boolean = false;
  errorMessage: string = "";

  async mounted() {
    const showId = this.$route.params.id;
    this.show = await db.getShow(showId);
    //this.show.acts.forEach(act => {
    //act.file = null;
    //act.link = null;
    //});
    this.$store.navigation = [
      { text: "trnstn", to: "/" },
      { text: "shows", to: "/shows" },
      {
        text: this.show.title + " #" + this.show.number,
        to: "/shows/" + this.show.id,
      },
      { text: "upload" },
    ];
    //this.currentStep = 3;
  }

  get rappers() {
    return this.show.acts.map((a) => ({ act: a }));
  }

  upload() {
    this.uploading = true;
    //const url = "https://api.mixcloud.com/upload/?access_token=" + localStorage.mixcloudAccessToken;
    //const show = this.show;
    const self = this;
    this.show.acts.forEach(async function (act) {
      console.log(act);
      /*
        if (act.file) {
          const form = new FormData();
          form.append("mp3", act.file);
          form.append("name", `${show.title} #${show.number} /w ${act.name} (${self.$options.filters.formatDate(show.createdAt)})`);
          form.append("description", act.bio);
          // TODO: Download and attach image
          for (let i = 0; i < 5 && i < show.tags.length; i++) {
            form.append(`tags-${i}-tag`, show.tags[i]);
          }
          console.log('uploading...')
          try {
            const res = await axios.post(url, form, {
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            });
            console.log(res);
            if (res.data.result.success) {
              act.link = "https://mixcloud.com" + res.data.result.key;
              act.file = null;
            } else {

              console.log("upload failed");
            }
          } catch (e) {
            self.errorMessage = e;
            console.log("upload failed", e);
          }

        }
        */
      self.uploading = false;
    });
  }
  continueAfterMixcloudLogin() {
    if (this.currentStep == 1) {
      this.currentStep = 2;
    }
  }
  async getKey() {
    const response = await fetch("https://soundcloud.com");
    const text = await response.text();
    const scripts = text.matchAll(/<script.+src="(.+)">/g);

    for (const script of scripts) {
      const url = script[1];

      if (url && !url.startsWith("https://a-v2.sndcdn.com")) return;

      const response = await fetch(url);
      const text = await response.text();
      const id = text.match(/client_id:\s+"([0-9a-zA-Z]{32})"/);

      if (id && typeof id[1] === "string") return id[1];
      else continue;
    }

    throw new Error("The Client ID was not found.");
  }
}
</script>

<style>
.upload-step-content {
  min-height: 50vh;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  flex-direction: column;
}

.upload-form .v-stepper__wrapper {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  min-height: 400px;
}

.upload-form__ctls {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
}
</style>