<template>
  <v-row>
    <v-col
      cols="12"
      sm="8"
      class="d-none d-sm-block"
      @dragover="dragover"
      @drop="drop"
    >
      <v-file-input
        ref="upload"
        v-model="file"
        :outlined="outlined"
        :label="label"
        prepend-icon=""
        prepend-inner-icon="mdi-file"
        :hide-details="!hint"
        :persistent-hint="persistentHint"
        :hint="hint"
        clearable
        :rules="maybeRequired"
      >
      </v-file-input>
    </v-col>
    <v-col cols="12" sm="4">
      <v-btn class="upload-btn" block outlined @click="uploadClick">{{
        file && $vuetify.breakpoint.xsOnly ? file.name : "choose file"
      }}</v-btn>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from "vue-property-decorator";

@Component
export default class FileUpload extends Vue {
  @Prop({ required: false, default: "audio file" }) label!: string;
  @Prop({ required: false, default: false }) required!: boolean;
  @Prop({ required: false, default: "" }) hint!: string;
  @Prop({ required: false, default: false }) persistentHint!: boolean;
  @Prop({ required: false, default: false }) outlined!: boolean;
  @Prop({ required: false }) value?: File = undefined;
  file?: File = undefined;

  mounted() {
    this.file = this.value;
  }

  get maybeRequired() {
    if (this.required) {
      return [(v: any) => !!v || "This field is required"];
    } else {
      return [];
    }
  }

  @Watch("file")
  onFileChanged(val: any) {
    this.$emit("input", val);
  }

  uploadClick(e: Event) {
    e.preventDefault();
    const v = this.$refs.upload as Vue;
    const i = v.$refs.input as HTMLElement;
    i.click();
  }
  dragover(e: Event) {
    e.preventDefault();
  }
  drop(event: DragEvent) {
    event.preventDefault();
    this.file = event.dataTransfer?.files[0];
  }
}
</script>

<style>
.upload-btn {
  min-height: 56px;
}
</style>