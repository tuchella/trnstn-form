<template>
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
                outdated data by clicking the button below.
              </p>
              <p>
                Note: this will remove all files related to this show. Make sure
                everything was transfered to the CMS correctly beforehand. No
                refunds.
              </p>
              <v-progress-linear v-model="progress"></v-progress-linear>
            </v-card-text>

            <v-card-actions>
              <v-btn color="red" block @click="deleteShow" :disabled="progress==100"> Delete Show Data </v-btn>
            </v-card-actions>
          </v-card>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { Show } from "@/util/types";
import FakeProgress from "@/util/FakeProgress";
import db from "@/util/db";
import { NO_ARTWORK } from "@/model/Artwork";

@Component
export default class CleanupStep extends Vue {
    progress: number = 0.0;
    @Prop({ required: true }) show!: Show;

    async deleteShow() {
        const fakeProgress = new FakeProgress(
          (p) => this.progress = p,
          1000,
          this.progress
        )
        fakeProgress.start();
        for (const act of this.show.acts) {
          if (act.techRider.delete) {
            await act.techRider.delete();
            act.techRider = NO_ARTWORK;
            await db.saveAct(this.show, act, "techRider")
          }
        }
        fakeProgress.stop();
        this.progress = 100;
    }
}
</script>

<style>

</style>