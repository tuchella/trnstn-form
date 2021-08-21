<template>
  <div>
    <v-row>
      <v-col cols="12" sm="4">
        <ArtworkUpload v-model="value" />
        <ShareLink v-model="link" v-if="isSignedIn && false" />
      </v-col>
      <v-col cols="12" sm="8">
        <!-- NAME -->
        <v-text-field
          label="Name"
          v-model="value.name"
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
                  color="red"
                  @click="$emit('remove')"
                >
                  <v-icon large>mdi-close-circle-outline</v-icon>
                </v-btn>
              </template>
              <span>Remove act</span>
            </v-tooltip>
          </template>
        </v-text-field>
        <!-- CITY -->
        <v-text-field v-model="value.city" label="City" />
        <!-- LABEL -->
        <v-text-field v-model="value.collective" label="Label/Collective" />
        <!-- PRONOUNS -->
        <v-text-field v-model="value.pronouns" label="Pronouns" />
        <!-- BIO -->
        <v-hover v-slot="{ hover }" open-delay="350">
          <v-textarea
            counter
            label="Bio"
            v-model="value.bio"
            hint="Please write down here what you want us to communicate about
                your show. This will also be used in the description of the set
                on Soundcloud, Mixcloud, and the website."
            :persistent-hint="hover"
          >
          </v-textarea>
        </v-hover>
        <!-- TRANSPORT -->
        <v-hover v-slot="{ hover }" open-delay="350">
          <v-select
            v-model="value.transport"
            :items="transportOptions"
            :menu-props="{ offsetY: true }"
            label="Transport"
            hint="We can reimburse maximum two transports per show. Train tickets are reimbursed at half fare. Car expenses are reimbursed on a flat rate calculated on the distance traveled (via michelin)."
            :persistent-hint="hover"
          >
          </v-select>
        </v-hover>
        <!-- SET LINK -->
        <v-hover v-slot="{ hover }" open-delay="350">
          <v-text-field
            v-model="value.setLink"
            label="Soundcloud/Mixcloud Set"
            hint="Please send a specific set from your guest that you would like us to share for the promotion."
            :persistent-hint="hover"
            type="url"
          >
          </v-text-field>
        </v-hover>
        <!-- TECH RIDER -->
        <v-hover v-slot="{ hover }" open-delay="350">
          <v-file-input
            label="Tech Rider"
            prepend-icon=""
            prepend-inner-icon="mdi-file"
            hint="If there is a live set, please upload the technical rider."
            :persistent-hint="hover"
          ></v-file-input>
        </v-hover>
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

<script>
import { auth } from "../firebase";
import ArtworkUpload from "./ArtworkUpload.vue";
import ShareLink from "./ShareLink.vue";
import { transportOptions } from "../util/enums";

export default {
  props: ["value", "removable", "showComment", "showId"],
  components: {
    ArtworkUpload,
    ShareLink,
  },
  computed: {
    link() {
      return `${window.location.protocol}//${window.location.host}/shows/${this.showId}/${this.value.id}`;
    },
    transportOptions() {
      return transportOptions;
    },
    isSignedIn() {
      return auth.currentUser ? true : false;
    },
  },
};
</script>