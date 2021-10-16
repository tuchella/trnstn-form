<template>
  <v-container class="upload-form" style="max-width: 900px">
    <v-stepper v-model="currentStep">
      <v-stepper-header>
        <v-stepper-step :complete="isStep1Complete" step="1"> Authorize </v-stepper-step>
        <v-divider></v-divider>
        <v-stepper-step :complete="isStep2Complete" step="2">Upload to Mixcloud</v-stepper-step>
        <v-divider></v-divider>
        <v-stepper-step :complete="isStep3Complete" step="3"> Publish to Website </v-stepper-step>
        <v-divider></v-divider>
        <v-stepper-step step="4"> Clean up data </v-stepper-step>
      </v-stepper-header>

      <v-stepper-items>
        <v-stepper-content step="1">
          <MixcloudAuthStep @auth-success="continueAfterMixcloudLogin"></MixcloudAuthStep>

          <div class="upload-form__ctls">
            <v-btn text> Cancel </v-btn>
            <v-btn color="primary" @click="currentStep = 2" :disabled="!isStep1Complete"> Continue </v-btn>
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
            <v-btn color="primary" @click="currentStep++" :disabled="!isStep2Complete"> Continue </v-btn>
          </div>
        </v-stepper-content>

        <v-stepper-content step="3">
          <PublishToCmsStep 
            v-for="act in show.acts"
            v-bind:key="act.id" 
            :act="act" :show="show" />

          <div class="upload-form__ctls">
            <v-btn text @click="currentStep--"> Back </v-btn>
            <v-btn color="primary" @click="currentStep++" :disabled="!isStep3Complete"> Continue </v-btn>
          </div>
        </v-stepper-content>

        <v-stepper-content step="4">
          <CleanupStep :show="show"></CleanupStep>

          <div class="upload-form__ctls">
            <v-btn text @click="currentStep--"> Back </v-btn>
            
          </div>
        </v-stepper-content>
      </v-stepper-items>
    </v-stepper>
  </v-container>
</template>

<script lang="ts">
import db from "@/util/db";

import CleanupStep from "@/components/publish/CleanupStep.vue";
import MixcloudAuthStep from "@/components/publish/MixcloudAuthStep.vue";
import MixcloudUploadStep from "@/components/publish/MixcloudUploadStep.vue";
import PublishToCmsStep from "@/components/publish/PublishToCmsStep.vue";

import { Component, Vue } from "vue-property-decorator";
import { Show } from "@/util/types";

@Component({
  components: {
    PublishToCmsStep,
    MixcloudAuthStep,
    MixcloudUploadStep,
    CleanupStep,
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
    this.$store.navigation = [
      { text: "trnstn", to: "/" },
      { text: "shows", to: "/shows" },
      {
        text: this.show.title,
        to: "/shows/" + this.show.id,
      },
      { text: "upload" },
    ];
  }

  // haha funny, need to wrap all acts in an object
  // otherwise vue doens't want to compile b/c 
  // something, something reactive something
  get rappers() {
    return this.show.acts.map((a) => ({ act: a }));
  }

  get isStep1Complete():boolean {
    return localStorage.getItem("mixcloudAccessToken") != null;
  }

  get isStep2Complete():boolean {
    return this.show.acts.every(act => act.mcLink);
  }

  get isStep3Complete():boolean {
    return this.show.acts.every(act => act.pageLink);
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