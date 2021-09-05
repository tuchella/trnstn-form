<template>
  <div :class="this.class">
    <v-input :rules="mustHaveImage">
      <v-img
        style="cursor: pointer"
        @dragover="dragover"
        @drop="drop"
        @click="imgClick"
        :src="value.img.src"
        :lazy-src="value.img.src"
        aspect-ratio="1"
        class="artwork-placeholder"
      >
        <template v-slot:placeholder>
          <v-row class="fill-height ma-0 pa-4" align="center" justify="center">
            <p class="text-center">
              Drop file here or click to upload your artwork *
            </p>
          </v-row>
        </template>
      </v-img>
      <v-file-input
        class="d-none"
        accept="image/*"
        v-model="file"
        @change="updateFile"
        ref="upload"
      ></v-file-input>
    </v-input>
    <v-btn
      block
      class="mt-2"
      color="primary"
      outlined
      :href="value.img.src"
      download
      target="_blank"
      v-if="isDownloadable"
    >
      Download
      <v-icon right dark>mdi-download-outline </v-icon>
    </v-btn>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { Act } from "@/util/types";
import { NO_ARTWORK } from "@/model/Artwork";

@Component
export default class ArtworkUpload extends Vue {
  content: string = "";
  file: File = new File([], "none");
  mustHaveImage: any = [
    () => this.value.img != NO_ARTWORK || "Please provide an artwork"
  ];
  @Prop({ required: true }) value!: Act;
  @Prop({ required: false }) class: string = "";

  imgClick(e: Event) {
    e.preventDefault();
    const input: any = (this.$refs.upload as Vue).$refs.input;
    if (input.click) {
      input.click();
    }
  }
  dragover(e: Event) {
    e.preventDefault();
  }
  drop(event: DragEvent) {
    event.preventDefault();
    let file = event.dataTransfer?.files[0];
    if (file) {
      this.value.img.update(file).then((i) => (this.value.img = i));
    }
  }
  updateFile() {
    if (this.file) {
      this.value.img.update(this.file).then((i) => (this.value.img = i));
    }
  }
  get isDownloadable(): boolean {
    console.log(this.value.img.src, this.value.img.src.startsWith("http"))
    return this.value.img.src.startsWith("http");
  }
}
</script>

<style>
.v-input.v-input--has-state.error--text .v-image {
  border: 2px solid red !important;
}
.artwork-placeholder {
  border: 1px solid rgba(0, 0, 0, 0.4);
  border-radius: 4px;
}
.artwork-placeholder .text-center {
  color: rgba(0, 0, 0, 0.6)
}
</style>