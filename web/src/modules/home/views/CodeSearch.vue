<template>
  <v-container fluid class="down-top-padding">
    <BaseBreadcrumb :title="page.title" :icon="page.icon" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>

    <BaseCard :showHeader="true">
      <template slot="left">
        <v-text-field
          label="Account Code Search"
          single-line
          hide-details
          v-model="search"
          @click:append="doSearch"
          @keydown="searchKeyUp"
        ></v-text-field>
      </template>

      <v-card class="default">
        <v-card-title>Form B Authorizations</v-card-title>
        <v-card-text>
          <v-data-table
            :items="searchResults"
            :headers="[
              { text: 'Name', value: 'employee.name' },
              { text: 'Title', value: 'employee.title' },
              { text: 'Department', value: 'department_code' },
              { text: 'Status', value: 'status' },
            ]"
            @click:row="selectAuthority"
            class="row-clickable"
          >
          </v-data-table>
        </v-card-text>
      </v-card>
    </BaseCard>
  </v-container>
</template>

<script>
import { mapActions } from "vuex";
export default {
  data: () => ({
    page: { title: "Code Search" },
    breadcrumbs: [{ text: "Dashboard", to: "/dashboard" }, { text: "Code Search" }],
    search: "",
    searchResults: [],
  }),
  async mounted() {
    if (this.$route.query && this.$route.query.query) {
      this.search = this.$route.query.query;
      await this.doSearch();
    }
  },
  methods: {
    ...mapActions("authority/formB", ["accountSearch"]),
    searchKeyUp(event) {
      if (event.key == "Enter") this.doSearch();
    },
    async doSearch() {
      this.searchResults = [];

      let cleanSearch = this.search.trim().toLowerCase();
      if (cleanSearch.length == 0) return;

      this.searchResults = await this.accountSearch(cleanSearch);
    },
    selectAuthority(item) {
      this.$router.push(`/form-b/${item._id}`);
    },
    createAuthorityClick() {
      this.$refs.createAuthorityDialog.show();
    },
  },
};
</script>
