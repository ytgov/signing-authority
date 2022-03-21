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
            <div class="float-left">Employees ({{ searchResults.length }} matches)</div>
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-divider></v-divider>

      <div style="max-height: 400px; overflow-y: scroll">
        <v-data-table
          hide-default-footer
          :headers="[
            { text: 'Name', value: 'display_name' },
            { text: 'YNET Id', value: 'ynet_id' },
            { text: 'Employee Id', value: 'employee_id' },
          ]"
          :items="searchResults"
          :items-per-page="-1"
          :loading="loading"
          @click:row="selectEmployee"
          class="clickable-row"
        >
        </v-data-table>
      </div>
    </v-navigation-drawer>
  </div>
</template>

<script>
import { EMPLOYEE_URL } from "../urls";
import axios from "axios";

export default {
  name: "Home",
  data: () => ({
    search: "",
    drawer: null,
    searchResults: [],
    loading: false,
  }),
  methods: {
    searchKeyUp(event) {
      if (event.key == "Enter") this.doSearch();
    },
    doSearch() {
      let cleanSearch = this.search.trim().toLowerCase();
      if (cleanSearch.length == 0) return;

      this.loading = true;

      axios
        .post(`${EMPLOYEE_URL}/search`, { terms: cleanSearch })
        .then((resp) => {
          this.searchResults = resp.data.data;
          this.drawer = true;
          this.resultCount = resp.data.meta.item_count;
        })
        .catch((err) => {
          this.$emit("showError", err);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    selectEmployee(item) {
      this.$router.push(`/employee/${item._id}`);
    },
  },
};
</script>
