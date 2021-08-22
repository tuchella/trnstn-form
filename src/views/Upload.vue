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
          <MixcloudUploadStep
            v-for="act in show.acts"
            v-bind:key="act.id" 
            :act="act" :show="show"
          ></MixcloudUploadStep>


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
import PublishToCmsStep from "../components/publish/PublishToCmsStep.vue";
import MixcloudAuthStep from "@/components/publish/MixcloudAuthStep.vue";
import MixcloudUploadStep from "@/components/publish/MixcloudUploadStep.vue";


import { Component, Vue } from "vue-property-decorator";
import { Show } from "@/util/types";

@Component({
  components: {
    PublishToCmsStep,
    MixcloudAuthStep,
    MixcloudUploadStep
  },
})
export default class Upload extends Vue {
  currentStep: number = 1;
  show: Show = new Show();
  overlay: boolean = false;
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

  // haha funny, need to wrap all acts in an object
  // otherwise vue doens't want to compile b/c 
  // something, something reactive something
  get rappers() {
    return this.show.acts.map((a) => ({ act: a }));
  }
  continueAfterMixcloudLogin() {
    if (this.currentStep == 1) {
      this.currentStep = 2;
    }
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