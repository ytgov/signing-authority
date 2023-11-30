<template>
  <div>
    <v-card class="mb-6" color="#fff2d5" style="height: 140px">
      <v-card-title>Authorities by Employee</v-card-title>
      <v-card-text>
        <v-text-field
          dense
          outlined
          background-color="white"
          label="Search employees"
          append-icon="mdi-magnify"
          @click:append="doSearch"
          @keydown="searchKeyUp"
          hint="Enter a Name or YNET Id and press Enter"
          v-model="search"
          class="mb-0"
        ></v-text-field>
      </v-card-text>
    </v-card>

    <v-navigation-drawer v-model="drawer" absolute right temporary width="600" loading>
      <v-list-item loading>
        <v-list-item-content>
          <v-list-item-title>
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
            { text: 'Authorities', value: 'authority_count' },
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
import { mapActions } from "vuex";

export default {
  name: "Home",
  data: () => ({
    search: "",
    drawer: null,
    searchResults: [],
    loading: false,
  }),
  computed: {},
  methods: {
    ...mapActions("home", ["employeeSearch"]),
    searchKeyUp(event) {
      if (event.key == "Enter") this.doSearch();
    },
    async doSearch() {
      let cleanSearch = this.search.trim().toLowerCase();
      if (cleanSearch.length == 0) return;

      this.loading = true;

      await this.employeeSearch({ term: cleanSearch })
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
      this.$router.push(`/employee/${item.ynet_id}`);
    },
  },
};
</script>
