<template>
  <div style="width: 100%">
    <v-row>
      <v-col cols="12" sm="3">
        <ArtworkUpload v-model="act" />
      </v-col>
      <v-col cols="12" sm="9">
        <v-row>
          <v-col cols="12">
            <span style="font-size: 1.5em">
              {{ show.title }}
              <span v-if="show.acts.length > 1">/w {{ act.name }}</span>
              ({{ show.date | formatDate }})
            </span>
            <div style="color: gray">
              <span v-for="tag in act.tags" :key="tag"> #{{ tag }} </span>
            </div>
          </v-col>
        </v-row>
        <FileUpload v-model="file.value" v-if="!act.mcLink" />
        <v-row>
          <v-col cols="12">
            <v-autocomplete
              label="Tags"
              :items="allTags"
              :search-input.sync="tagSearch"
              v-model="act.tags"
              @change="tagSearch = ''"
              auto-select-first
              chips
              deletable-chips
              multiple
            ></v-autocomplete>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12">
            <v-textarea 
              label="Description"
              v-model="act.bio"
              class="mb-2"
            >
            </v-textarea>
          </v-col>
        </v-row>
        <v-row>
            <v-spacer></v-spacer>
            <v-btn
              class="ma-2"
              color="secondary"
              :disabled="!completed"
              :href="act.mcLink"
              target="_blank"
              >visit</v-btn
            >
            <v-btn
              class="ma-2 mr-3"
              color="primary"
              @click="upload"
              :disabled="progress > 0 || !file.present()"
              >publish</v-btn
            >
        </v-row>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" class="mb-10">
        <v-alert type="error" v-if="errorMessage">
          {{ errorMessage }}
        </v-alert>
        <v-progress-linear v-model="progress"></v-progress-linear>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import { getFileName } from "@/model/Artwork";
import Maybe from "@/model/Maybe";
import { Act, Show } from "@/model/Show";

import ArtworkUpload from "@/components/ArtworkUpload.vue";
import FileUpload from "@/components/FileUpload.vue";

import db from "@/util/db";
import { tags } from "@/util/enums";
import FakeProgress from "@/util/FakeProgress";

import axios from "axios";
import { Component, Prop, Vue } from "vue-property-decorator";

@Component({
  components: {
    ArtworkUpload,
    FileUpload,
  },
})
export default class MixcloudUploadStep extends Vue {
  file: Maybe<File> = Maybe.empty();
  progress: number = 0.0;
  errorMessage: string = "";
  allTags:string[] = tags;
  tagSearch:string = "";
  @Prop({ required: true }) act!: Act;
  @Prop({ required: true }) show!: Show;

  get title(): string {
    let title = this.show.title;
    if (this.show.acts.length > 1) {
      title += " /w " + this.act.name;
    }
    title += ` (${this.$options.filters!.formatDate(this.show.date)})`;
    return title;
  }

  async upload() {
    const url =
      "https://api.mixcloud.com/upload/?access_token=" +
      localStorage.getItem("mixcloudAccessToken");
    const act = this.act;
    const show = this.show;
    if (this.file.present()) {
      this.progress = 1;
      const form = new FormData();
      form.append("mp3", this.file.value!);
      form.append("name", this.title);
      form.append("description", act.bio);
      const artwork = await act.img.download();
      this.progress = 5;
      if (artwork) {
        form.append("picture", artwork, getFileName(act.img));
      }
      for (let i = 0; i < 5 && i < act.tags.length; i++) {
        form.append(`tags-${i}-tag`, act.tags[i]);
      }
      this.progress = 10;
      
      const fakeProgress = new FakeProgress(
        (p) => this.progress = p,
        1000,
        this.progress
      )
      fakeProgress.start();

      try {
        const res = await axios.post(url, form, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        fakeProgress.stop();
        if (res.data.result.success) {
          act.mcLink = "https://mixcloud.com" + res.data.result.key;
          await db.saveAct(show, act, "mcLink", "bio", "tags");
          this.file.value = undefined;
        } else {
          this.errorMessage = "upload failed";
          console.log("upload failed", res);
        }
        this.progress = 100;
      } catch (e:any) {
        fakeProgress.stop();
        if (e.message) {
          this.errorMessage = e.message;
        } else {
          this.errorMessage = String(e);
        }
        console.log("upload failed", e);
      }
    }
  }

  get completed(): boolean {
    return this.act.mcLink != undefined || this.progress >= 100;
  }
}
</script>

<style>
</style>