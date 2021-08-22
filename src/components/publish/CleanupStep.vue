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
            </v-card-text>

            <v-card-actions>
              <v-btn color="red" block @click="deleteShow"> Delete Show Data </v-btn>
            </v-card-actions>
          </v-card>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import { Show } from "@/util/types";

@Component
export default class CleanupStep extends Vue {
    @Prop({ required: true }) show!: Show;

    deleteShow() {
        console.log(this.show);
    }
}
</script>

<style>

</style>