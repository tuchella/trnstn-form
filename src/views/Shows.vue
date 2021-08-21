<template>
  <v-container>
    <v-row>
      <v-col cols="12" lg="8" style="display:flex; justify-content: flex-end; align-items: center; flex-wrap: wrap;">
        <v-autocomplete label="show" append-outer-icon="mdi-magnify" value=" " placeholder=" " :persistent-placeholder="true" :items="residencies"
          v-model="filter.residency" @change="onFilter" clearable @click:clear=onFilter>
        </v-autocomplete>
        <v-text-field class="mx-2" label="from" type="date" placeholder="dd/mm/yyyy" :persistent-placeholder="true"
          v-model="filter.from" @change="onFilter" clearable @click:clear=onFilter
        ></v-text-field>
        <v-text-field class="mx-2" label="to" type="date" placeholder="dd/mm/yyyy" :persistent-placeholder="true"
          v-model="filter.to" @change="onFilter" clearable @click:clear=onFilter
        ></v-text-field>
        <v-btn large color="primary" class="float-right ml-4 mb-4" @click="onFilter" >SEARCH</v-btn>
      </v-col>
      <v-col cols="12" lg="4" style="display:flex; justify-content: flex-end; align-items: center;">
        <v-btn large color="primary" class="mb-4 mx-4" to="/shows/create" style="min-width:25%">
          IMPORT 
          <v-icon right>mdi-calendar-refresh</v-icon>
        </v-btn>
        <v-btn large color="primary" class="mb-4" to="/shows/create" style="min-width:25%">
          ADD NEW
          <v-icon right>mdi-page-next-outline</v-icon>
        </v-btn>
      </v-col>
      <v-col cols="12" v-if="loading">
        <v-progress-linear
      indeterminate
      color="cyan"
    ></v-progress-linear>
      </v-col>
    </v-row>
    <v-row v-for="item in shows" :key="item.id" class="border-bottom">
      <v-col cols="12" sm="6" class="show-list-title">
        {{ item.title }} #{{ item.number }}
      </v-col>
      <v-col cols="4" sm="2" >
        {{ item.date | formatDate }}
      </v-col>
      <v-col colls="8" sm="4">
        <div class="float-right">
          <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-btn icon :to="{ name: 'Show', params: { id: item.id }}" v-bind="attrs" v-on="on"><v-icon>mdi-pencil-outline</v-icon></v-btn>
          </template>
          <span>Edit/View</span>
        </v-tooltip>
        
        <v-dialog
          v-model="dialog[item.id]"
          width="500"
        >
          <!--
          <template v-slot:activator="{ on, attrs }">
            <v-btn v-on="on" v-bind="attrs" icon><v-icon>mdi-delete-outline</v-icon></v-btn>
          </template>
          -->
          <template v-slot:activator="{ on: menu, attrs }">
            <v-tooltip bottom>
              <template v-slot:activator="{ on: tooltip }">
                <v-btn
                  icon
                  v-bind="attrs"
                  v-on="{ ...tooltip, ...menu }"
                >
                  <v-icon>mdi-delete-outline</v-icon>
                </v-btn>
              </template>
              <span>Delete</span>
            </v-tooltip>
          </template>

          <v-card>
            <v-card-title>
              Are you sure?
            </v-card-title>

            <v-card-text>
              This can never be undone. Once gone, it's gone forever. So I ask again: Are you sure?<br/>
              Think about it, carefully.<br/>
            </v-card-text>

            <v-divider></v-divider>

            <v-card-actions class="d-flex" style="flex-wrap: wrap; justify-content: center;">
              <v-btn
                color="red"
                text
                @click="dialog[item.id] = false; remove(item);"
              >
                yes, delete this show
              </v-btn>
              <v-btn
                color="primary"
                text
                @click="dialog[item.id] = false"
              >
                nevermind, cancel
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-btn icon :to="{ name: 'Upload', params: { id: item.id }}" v-bind="attrs" v-on="on"><v-icon>mdi-calendar-cursor</v-icon></v-btn>
          </template>
          <span>Add to program</span>
        </v-tooltip>
        <v-tooltip bottom>
          <template v-slot:activator="{ on, attrs }">
            <v-btn icon :to="{ name: 'Upload', params: { id: item.id }}" v-bind="attrs" v-on="on"><v-icon>mdi-cloud-upload-outline</v-icon></v-btn>
            
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
import { residencies } from "../util/enums";

import { Component, Vue } from "vue-property-decorator";
import { searchShows, ShowSearchFilter, ShowSearchResult } from "@/util/search";

@Component
export default class Shows extends Vue {
  dialog:any = {};
  shows:Array<ShowSearchResult> = [];
  residencies:Array<any> = residencies;
  hasMore:boolean = true;
  searchDelay?:number;
  filter:ShowSearchFilter = new ShowSearchFilter();
  loading:boolean = false; 

  created() {
    this.getDataFromApi();

    this.$store.navigation = [
      {text: 'trnstn', to: '/' },
      {text: 'shows' }];
  }

  remove(show:ShowSearchResult) {
    this.shows = this.shows.filter(s => s.id != show.id);
  }
  onFilter() {
      this.loading = true;
      clearTimeout(this.searchDelay);
      
      this.searchDelay = setTimeout(() => {
        this.shows = [];
        this.getDataFromApi();
        this.loading = false;
      }, 600);
    }
    more() {
      this.getDataFromApi(this.shows[this.shows.length -1].date);
    }
    getDataFromApi(offset?:Date) {
      this.loading = true;
      searchShows(this.filter, offset).then((data) => {
          this.shows.push(...data);
          this.hasMore = data.length == 10;
          this.loading = false;
      });
    }
}
/*
const something = {
  data() {
    return {
      dialog: {},
      shows: [],
      residencies: residencies,
      hasMore: true,
      searchDelay: null,
      filter: {
        residency: null,
        from: null,
        to: null,
      },
      loading: true,
    };
  },
  created() {
    this.getDataFromApi(null);
    this.$store.navigation = [
      {text: 'trnstn', to: '/' },
      {text: 'shows' }];
  },
  methods: {
    
  },
};
*/
</script>

<style>

.border-bottom {
  border-bottom: 1px solid black;
}
.border-bottom {
  line-height: 40px;
}
.border-bottom:hover {
  background-color: #EEE;
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