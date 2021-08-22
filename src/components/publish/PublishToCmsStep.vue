<template>
  <div style="width:100%">
      <v-row>
        <v-col cols="12" class="d-flex flex-wrap  justify-end ">
          <div class="text-h4 flex-grow-1 d-flex align-center">
            <span>{{ show.title }}
                <span v-if="show.acts.length > 1">/w {{ act.name }}</span>
            </span>
          </div>
          <v-btn class="ma-2" color="secondary" :disabled="!completed" :href="page" target="_blank">visit</v-btn>
          <v-btn class="ma-2" color="primary" @click="publish" :disabled="progress > 0 || completed">publish</v-btn>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12">
          <v-progress-linear v-model="progress"></v-progress-linear>
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
  
  @Prop({ required: true }) act!: Act;
  @Prop({ required: true }) show!: Show;

  publish() {
    kirby.publishShow(this.show, this.act, this.updateProgress);
  }

  get completed(): boolean {
    return this.progress >= 100 || this.act.pageLink != undefined;
  }

  get page(): string {
    return this.act.pageLink || "";
  }

  updateProgress(p:number) {
    this.progress = p*100;
  }
}
</script>

<style>
</style>