<template>
  <div>
    <v-row>
      <v-col cols="12" sm="4">
        <ArtworkUpload v-model="value" class="mt-2" />
        <ShareLink v-model="link" v-if="isSignedIn && false" />
      </v-col>
      <v-col cols="12" sm="8">
        <!-- NAME -->
        <v-text-field
          label="Name *"
          v-model="value.name"
          :rules="requiredField"
          @input="$emit('name-changed')"
        >
          <template v-slot:append-outer v-if="removable">
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  style="margin-top: -4px"
                  v-bind="attrs"
                  v-on="on"
                  icon
                  @click="$emit('remove')"
                >
                  <v-icon large>mdi-account-remove-outline</v-icon>
                </v-btn>
              </template>
              <span>Remove guest</span>
            </v-tooltip>
          </template>
        </v-text-field>
        <!-- CITY -->
        <v-text-field
          :rules="requiredField"
          v-model="value.city"
          label="City *"
        />
        <!-- LABEL -->
        <v-text-field
          :rules="requiredField"
          v-model="value.collective"
          label="Label/Collective *"
        />
        <!-- PRONOUNS -->
        <v-text-field
          :rules="requiredField"
          v-model="value.pronouns"
          label="Pronouns *"
        />
        <!-- BIO -->
        <v-textarea
          counter
          :rules="bioRules"
          label="Bio *"
          v-model="value.bio"
          hint="Please write down here what you want us to communicate about
              your show. This will also be used in the description of the set
              on Mixcloud and the website."
          persistent-hint
          class="mb-2"
          validate-on-blur
        >
        </v-textarea>
        <!-- TAGS -->
        <v-autocomplete
          label="Tags *"
          :items="searchTags"
          :rules="tagRules"
          :search-input.sync="tagSearch"
          :menu-props="{ maxHeight: 420 }"
          placeholder="type to search tags..."
          v-model="value.tags"
          @change="tagSearch = ''"
          auto-select-first
          chips
          deletable-chips
          multiple
          validate-on-blur
        ></v-autocomplete>
        <!-- TRANSPORT -->
        <v-select
          v-model="value.transport"
          :items="transportOptions"
          :menu-props="{ offsetY: true }"
          label="Transport"
          hint="We can reimburse maximum two transports per show. Train tickets are reimbursed at half fare. Car expenses are reimbursed on a flat rate calculated on the distance traveled (via michelin)."
          persistent-hint
          class="mb-2"
        >
        </v-select>
        <!-- IG LINK -->
        <v-text-field
          v-model="value.igLink"
          label="Instagram Profile"
          persistent-hint
          type="url"
        >
        </v-text-field>
        <!-- SET LINK -->
        <v-text-field
          v-model="value.scLink"
          label="Soundcloud/Mixcloud Profile"
          hint="Please provide a link to your soundcloud profile that you would like us to share for the promotion."
          persistent-hint
          type="url"
          class="mb-4"
        >
        </v-text-field>
        <!-- TECH RIDER -->
        <v-switch
          v-model="enterTechRiderAsFile"
          label="I have a tech rider as a PDF"
        ></v-switch>
        <v-textarea
          v-if="!enterTechRiderAsFile"
          v-model="value.techRiderText"
          label="Required Material *"
          hint="Let us know what technial material you bring or need from us."
          persistent-hint
          class="mb-4"
          :rules="requiredField"
        >
        </v-textarea>
        <div v-else>
          <FileUpload
            v-bind:value="techRider"
            v-bind:persistentHint="true"
            v-bind:hint="'Let us know what technial material you bring or need from us.'"
            v-bind:label="'Tech Rider *'"
            v-bind:outlined="false"
            :required="true"
            @input="techRiderUploaded"
          />
        </div>
        <v-row>
          <v-col cols="12" sm="8" class="pt-0">
            <div class="v-text-field__details">
              <div class="v-messages theme--light">
                <div class="v-messages__wrapper">
                  Technical set up available in the container:
                  <a
                    href="https://trnstnradio.com/assets/TRNSTN_RADIO_TECH_SETUP.pdf"
                    target="_blank"
                    >tech_setup.pdf</a
                  >
                </div>
              </div>
            </div>
          </v-col>
          <v-col cols="12" sm="4" class="pt-0">
            <v-btn
              class="upload-btn"
              block
              outlined
              v-if="value.techRider.isStored"
              :href="value.techRider.src"
              target="_blank"
              download
              >download</v-btn
            >
          </v-col>
        </v-row>
        <!-- COMMENTS -->
        <v-textarea
          v-model="value.comment"
          counter
          label="Comments/Remarks"
          v-if="showComment"
        ></v-textarea>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="ts">
import { app } from "@/util/app";
import ArtworkUpload from "./ArtworkUpload.vue";
import ShareLink from "./ShareLink.vue";
import { transportOptions } from "../util/enums";
import FileUpload from "./FileUpload.vue";
import { tags } from "../util/enums";
import { Act } from "@/model/Show";

import { Component, Vue, Prop } from "vue-property-decorator";

@Component({
  components: {
    ArtworkUpload,
    ShareLink,
    FileUpload,
  },
})
export default class ActForm extends Vue {
  @Prop({ required: true }) value!: Act;
  @Prop({ default: false }) removable!: boolean;
  @Prop({ default: false }) showComment!: boolean;
  @Prop({ required: false }) showId?: string;

  requiredField = [(v: any) => !!v || "This field is required"];
  bioRules = [
    (v: any) => !!v || "This field is required",
    (v: any) => v.length > 50 || "Please enter at least 50 characters",
  ];
  tagRules = [
    (v: any) =>
      (v && v.length >= 3 && v.length <= 6) || "Please select 3-6 tags",
  ];
  techRider = undefined;
  enterTechRiderAsFile = false;
  allTags = tags;
  tagSearch = "";

  techRiderUploaded(val: File) {
    if (val) {
      this.value.techRider.update(val).then((i) => (this.value.techRider = i));
    }
  }

  get link() {
    return `${window.location.protocol}//${window.location.host}/form/shows/${this.showId}/${this.value.id}`;
  }
  get transportOptions() {
    return transportOptions;
  }
  get isSignedIn() {
    return app.auth.isSignedIn();
  }
  get searchTags() {
    const term = this.tagSearch;
    return tags.sort(function (a, b) {
      const aStartsWithTerm = a.toLowerCase().indexOf(term) == 0;
      const bStartsWithTerm = b.toLowerCase().indexOf(term) == 0;
      if (
        (aStartsWithTerm && !bStartsWithTerm) ||
        (!aStartsWithTerm && bStartsWithTerm)
      ) {
        return aStartsWithTerm ? -1 : 1;
      } else {
        return a.localeCompare(b);
      }
    });
  }
}
</script>