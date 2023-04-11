<template>
  <v-container>
    <v-row>
      <v-col
        cols="12"
        md="7"
        style="
          display: flex;
          justify-content: flex-end;
          align-items: center;
          flex-wrap: wrap;
        "
      >
        <v-text-field
          class="mx-2"
          label="from"
          type="date"
          placeholder="dd/mm/yyyy"
          :persistent-placeholder="true"
          v-model="filter.from"
          @change="onFilter"
          clearable
          @click:clear="onFilter"
        ></v-text-field>
        <v-text-field
          class="mx-2"
          label="to"
          type="date"
          placeholder="dd/mm/yyyy"
          :persistent-placeholder="true"
          v-model="filter.to"
          @change="onFilter"
          clearable
          @click:clear="onFilter"
        ></v-text-field>
        <v-btn
          large
          color="primary"
          class="float-right ml-4 mb-4"
          @click="onFilter"
          >SEARCH</v-btn
        >
      </v-col>
      <v-col
        cols="12"
        md="5"
        style="display: flex; justify-content: flex-end; align-items: center"
      >
        <v-btn
          large
          color="primary"
          class="mb-4 mr-1"
          :href="artworkDownloadLink"
          style="min-width: 25%"
          :disabled="selectedShows.length < 1"
        >
          DOWNLOAD ARTWORKS
        </v-btn>
        <v-btn large color="primary" class="mb-4" to="/" style="min-width: 25%">
          ADD NEW
          <v-icon right>mdi-page-next-outline</v-icon>
        </v-btn>
      </v-col>
      <v-col cols="12" v-if="loading">
        <v-progress-linear indeterminate color="cyan"></v-progress-linear>
      </v-col>
    </v-row>
    <v-row v-for="item in shows" :key="item.id" class="border-bottom">
      <v-col cols="9" sm="6" class="show-list-title">
        <v-checkbox
          hide-details
          style="display: inline-block"
          class="shrink mr-2 mt-0 pt-2"
          v-model="selectedShows"
          :value="item"
        ></v-checkbox>
        <span class="mb-1" style="vertical-align: top">
          {{ item.title }}
        </span>
      </v-col>
      <v-col cols="3" sm="2">
        <span :class="['show-status', 'show-status--' + item.status]">{{
          item.status
        }}</span>
      </v-col>
      <v-col cols="4" sm="2">
        {{ item.date | formatDate }}
      </v-col>
      <v-col colls="8" sm="2">
        <div class="float-right">
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                icon
                :to="{ name: 'Show', params: { id: item.id } }"
                v-bind="attrs"
                v-on="on"
                ><v-icon>mdi-pencil-outline</v-icon></v-btn
              >
            </template>
            <span>Edit/View</span>
          </v-tooltip>

          <v-dialog v-model="dialog[item.id]" width="500">
            <template v-slot:activator="{ on: menu, attrs }">
              <v-tooltip bottom>
                <template v-slot:activator="{ on: tooltip }">
                  <v-btn icon v-bind="attrs" v-on="{ ...tooltip, ...menu }">
                    <v-icon>mdi-delete-outline</v-icon>
                  </v-btn>
                </template>
                <span>Delete</span>
              </v-tooltip>
            </template>

            <v-card>
              <v-card-title> Are you sure? </v-card-title>

              <v-card-text>
                This can never be undone. Once gone, it's gone forever. So I ask
                again: Are you sure?<br />
                Think about it, carefully.<br />
              </v-card-text>

              <v-divider></v-divider>

              <v-card-actions
                class="d-flex"
                style="flex-wrap: wrap; justify-content: center"
              >
                <v-btn
                  color="red"
                  text
                  @click="
                    dialog[item.id] = false;
                    remove(item);
                  "
                >
                  yes, delete this show
                </v-btn>
                <v-btn color="primary" text @click="dialog[item.id] = false">
                  nevermind, cancel
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                icon
                :to="{ name: 'Upload', params: { id: item.id } }"
                v-bind="attrs"
                v-on="on"
                ><v-icon>mdi-cloud-upload-outline</v-icon></v-btn
              >
            </template>
            <span>Publish to archive</span>
          </v-tooltip>
        </div>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <v-btn text block @click="more" :disabled="!hasMore">MORE</v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { searchShows, ShowSearchFilter, ShowSearchResult } from "@/util/search";
import db from "@/util/db";

@Component
export default class Shows extends Vue {
  dialog: any = {};
  shows: Array<ShowSearchResult> = [];
  hasMore: boolean = true;
  searchDelay?: any; // NodeJS.Timeout;  <--- doesn't work :/ compiler says 'NodeJS' is not defined
  filter: ShowSearchFilter = new ShowSearchFilter();
  loading: boolean = false;
  selectedShows: Array<ShowSearchResult> = [];

  created() {
    this.getDataFromApi();

    this.$store.navigation = [{ text: "trnstn", to: "/" }, { text: "shows" }];
  }

  get artworkDownloadLink() {
    return (
      "https://europe-west1-trnstn-83e1a.cloudfunctions.net/exportShow?id=" +
      //return "http://localhost:5000/trnstn-83e1a/europe-west1/exportShow?id=" +
      this.selectedShows.map((show) => show.id).join(",")
    );
  }

  remove(show: ShowSearchResult) {
    db.deleteShow(show.id).then(() => {
      this.shows = this.shows.filter((s) => s.id != show.id);
    });
  }
  onFilter() {
    this.loading = true;
    if (this.searchDelay) {
      clearTimeout(this.searchDelay);
    }
    this.searchDelay = setTimeout(() => {
      this.shows = [];
      this.getDataFromApi();
      this.loading = false;
    }, 600);
  }
  more() {
    const last = this.shows[this.shows.length - 1];
    this.getDataFromApi(last.date, last.id);
  }
  getDataFromApi(offset?: Date, offsetId?: string) {
    this.loading = true;
    searchShows(this.filter, offset, offsetId).then((data) => {
      this.shows.push(...data);
      this.hasMore = data.length == 10;
      this.loading = false;
    });
  }
}
</script>

<style>
.border-bottom {
  border-bottom: 1px solid black;
}
.border-bottom {
  line-height: 40px;
}
.border-bottom:hover {
  background-color: #eee;
}

.show-status {
  border: 1px solid black;
  font-size: 0.9em;
  padding: 2px 4px;
  border-radius: 3px;
  text-transform: uppercase;
}
.show-status.show-status--open {
  border-color: lightgray;
  color: lightgray;
}
.show-status.show-status--published {
  border-color: darkgreen;
  color: darkgreen;
}
.show-status.show-status--uploaded {
  border-color: purple;
  color: purple;
}

.show-list-title {
  font-size: 1.5em;
}
@media (min-width: 600px) {
  .show-list-title {
    font-size: 1em;
  }
}
</style>