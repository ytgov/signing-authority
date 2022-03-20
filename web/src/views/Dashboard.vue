<template>
  <div class="home">
    <h1>Signing Authority App Home</h1>
    <p></p>
    <v-card class="mt-5" color="#fff2d5">
      <v-card-title>Find an Employee</v-card-title>
      <v-card-text>
        <v-text-field
          dense
          outlined
          background-color="white"
          label="Search"
          append-icon="mdi-magnify"
          @click:append="doSearch"
          @keydown="searchKeyUp"
          hint="Enter a Name, YNET ID or Employee ID"
          v-model="search"
        ></v-text-field>
        <router-link to="/search">Advanced search</router-link>
      </v-card-text>
    </v-card>

    <v-navigation-drawer
      v-model="drawer"
      absolute
      right
      temporary
      width="600"
      loading
    >
      <v-list-item loading>
        <v-list-item-content>
          <v-list-item-title>
            <div class="float-right">
              <v-btn
                x-small
                color="primary"
                text
                :to="'/search?text=' + search"
                class="my-0"
                style="font-size: 12px !important"
              >
                Advanced search</v-btn
              >
            </div>
            <div class="float-left">Authority ({{ resultCount }} matches)</div>
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-divider></v-divider>

      <div style="max-height: 400px; overflow-y: scroll">
        <v-data-table
          hide-default-footer
          :headers="[
            { text: '', value: 'action', width: '40px' },
            { text: 'Name', value: 'display_name' },
            { text: 'Title', value: 'title' },
            { text: 'Department', value: 'department' },
          ]"
          :items="searchResults"
          :items-per-page="-1"
          @click:row="selectAuthority"
          class="clickable-row"
        >
          <template v-slot:item.action="{ item }">
            <v-btn
              outlined
              icon
              color="primary"
              :to="`/authority/${item.student_id}`"
              title="View student record"
              ><v-icon>mdi-signature</v-icon></v-btn
            >
          </template>
        </v-data-table>
      </div>

      <v-divider></v-divider>

      <v-card class="default my-4 mx-5" v-if="selectedAuthority">
        <v-card-title>Authority for {{ selectedAuthority.name }}</v-card-title>
        <v-card-text>
          <div v-for="(app, i) of signingAuthorities" :key="i">
            <v-list-item
              two-line
              :to="'/card/' + app.HISTORY_DETAIL_ID + '/personal'"
            >
              <v-list-item-content>
                <v-list-item-title
                  >{{ app.ACADEMIC_YEAR }}:
                  {{ app.institution_name }}</v-list-item-title
                >
                <v-list-item-subtitle
                  >{{ app.study_area_name }} ({{
                    app.program_name
                  }})<br />Applications: YG</v-list-item-subtitle
                >
              </v-list-item-content>
            </v-list-item>
            <v-divider v-if="i < signingAuthorities.length - 1"></v-divider>
          </div>
        </v-card-text>
      </v-card>
    </v-navigation-drawer>
  </div>
</template>

<script>
import {EMPLOYEE_URL} from "../urls"
import axios from "axios";

export default {
  name: "Home",
  data: () => ({
    search: "",
    drawer: null,
    selectedAuthority: null,
    signingAuthorities: [],
    searchResults: [],
    resultCount: 0,
  }),
  methods: {
    searchKeyUp(event) {
      if (event.key == "Enter") this.doSearch();
    },
    doSearch() {
      this.selectedAuthority = null;
      this.signingAuthorities = [];
      let cleanSearch = this.search.trim().toLowerCase();
      if (cleanSearch.length == 0) return;
      // hack to show search funtcion
      this.searchResults = [{ name: "Jane Smith" }, { name: "Alex Jones" }];
      this.drawer = true;
      this.resultCount = this.searchResults.length;

      axios
        .post(`${EMPLOYEE_URL}/search`, { terms: cleanSearch })
        .then((resp) => {
          this.searchResults = resp.data.data;
          this.drawer = true;
          this.resultCount = resp.data.meta.item_count;
        })
        .catch((err) => {
          this.$emit("showError", err);
        });
    },
    selectAuthority(item) {
      this.selectedAuthority = item;
      this.$router.push(`/employee/${item._id}`);
    },
  },
};
</script>
