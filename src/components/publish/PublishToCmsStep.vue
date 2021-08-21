<template>
  <div style="width:100%">
      <v-row>
        <v-col cols="12" class="d-flex flex-wrap  justify-end ">
          <div class="text-h4 flex-grow-1 d-flex align-center">
            <span>{{ show.title }}
                <span v-if="show.acts.size > 1">/w {{ value.name }}</span>
            </span>
          </div>
          <v-btn class="ma-2" color="secondary" :disabled="!completed" :href="page" target="_blank">visit</v-btn>
          <v-btn class="ma-2" color="primary" @click="publish" :disabled="progress > 0">publish</v-btn>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12">
          <v-progress-linear v-model="progress"></v-progress-linear>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12">
          <span v-if="completed">{{ page }}</span>
        </v-col>
      </v-row>
  </div>
</template>

<script lang="ts">
import kirby from "@/util/kirby";

import { Component, Vue, Prop } from "vue-property-decorator";
import { Show, Act } from "@/util/types";

@Component
export default class PublishToCmsStep extends Vue {
  ok: boolean = true;
  progress: number = 0.0;
  page: string = "";
  @Prop({ required: true }) value!: Act;
  @Prop({ required: true }) show!: Show;

  publish() {
    kirby.publishShow(this.show, this.value, this.updateProgress)
      .then(page => this.page = page);
  }

  get completed(): boolean {
    return this.progress >= 100;
  }

  updateProgress(p:number) {
    this.progress = p*100;
  }
}
</script>

<style>
</style>