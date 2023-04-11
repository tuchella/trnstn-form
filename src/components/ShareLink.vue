<template>
  <div>
    <v-text-field
      :value="value"
      readonly
      color="green"
      class="share-link"
      ref="shareLink"
    >
      <template v-slot:append-outer>
        <v-btn color="green" outlined style="top: -6px" @click="copyLink">
          <v-icon left>mdi-clipboard-text-multiple-outline</v-icon>
          COPY
        </v-btn>
      </template>
    </v-text-field>

    <v-snackbar v-model="showCopyNotification" timeout="2000">
      Link copied to clipboard

      <template v-slot:action="{ attrs }">
        <v-btn
          color="green"
          text
          v-bind="attrs"
          @click="showCopyNotification = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

@Component
export default class ShareLink extends Vue {
  @Prop({ required: true }) value!: string;
  showCopyNotification: boolean = false;

  copyLink() {
      const el = this.$refs.shareLink as Vue;
      const input = el.$refs.input as HTMLInputElement;
      input.select();
      document.execCommand("copy");
      this.showCopyNotification = true;
    }
}
</script>

<style>
.share-link .v-text-field__slot input {
  color: #4caf50 !important;
  caret-color: #4caf50 !important;
}
</style>