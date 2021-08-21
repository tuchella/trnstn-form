<template>
  <div>
    <v-img
      style="cursor: pointer"
      @dragover="dragover"
      @drop="drop"
      @click="imgClick"
      :src="value.img.src"
      :lazy-src="value.img.src"
      aspect-ratio="1"
      class="grey lighten-2"
    >
      <template v-slot:placeholder>
        <v-row class="fill-height ma-0 pa-4" align="center" justify="center">
          <p class="text-center">
            Drop file here or click to upload your artwork
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
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";
import { Act } from "@/util/types";

@Component
export default class ArtworkUpload extends Vue {
  content: string = "";
  file: File = new File([], "none");
  @Prop({ required: true }) value!: Act;

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
}
/*
const whatever = {
  props: ["value"],
  data: () => ({
    content: "",
  }),
  methods: {
    imgClick: function (e) {
      e.preventDefault();
      this.$refs.upload.$refs.input.click();
    },
    dragover(e) {
      e.preventDefault();
    },
    drop: function (event) {
      event.preventDefault();
      this.value.file = event.dataTransfer.files[0];
    },
    loadImageFromFirebase: function () {
      storage
        .ref()
        .child(this.value.url)
        .getDownloadURL()
        .then((url) => (this.content = url));
    },
  },
  mounted() {
    if (this.value.url) {
      this.loadImageFromFirebase();
    }
  },
  watch: {
    "value.file": function (val) {
      if (val) {
        const self = this;
        let reader = new FileReader();
        reader.readAsDataURL(val);
        reader.onloadend = function () {
          self.content = reader.result;
        };
      } else if (!this.content && this.value.url) {
        this.loadImageFromFirebase();
      }
    },
  },
};
*/
</script>

<style>
</style>