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
          class="mr-5"
        ></v-text-field>

        <v-menu
          v-model="dateMenu"
          :close-on-content-click="false"
          transition="scale-transition"
          left
          nudge-top="26"
          offset-y
          min-width="auto"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-text-field
              v-model="date"
              label="As at date"
              append-icon="mdi-calendar"
              readonly
              hide-details
              background-color="white"
              v-bind="attrs"
              v-on="on"
            ></v-text-field>
          </template>
          <v-date-picker v-model="date" @input="dateMenu = false" :max="today"></v-date-picker>
        </v-menu>

        <v-btn small @click="doSearch" color="primary" class="my-0 ml-5">Search</v-btn>
      </template>

      <v-alert v-if="responseErrors" dense type="error">
        {{ responseErrors }}
      </v-alert>

      <v-card class="default">
        <v-card-title
          >Form B Authorizations that encompass '<strong>{{ searchValue }}</strong
          >'</v-card-title
        >
        <v-card-text>
          <v-data-table
            :items="searchResults"
            :loading="loading"
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
import moment from "moment";
import { mapActions } from "vuex";
import { cleanCoding } from "@/modules/forms/formB/store";

export default {
  data: () => ({
    page: { title: "Code Search" },
    breadcrumbs: [{ text: "Dashboard", to: "/dashboard" }, { text: "Code Search" }],
    search: "",
    searched: "",
    searchResults: [],
    responseErrors: undefined,
    loading: false,

    dateMenu: null,
    date: null,
    today: moment().format("YYYY-MM-DD"),
  }),
  async mounted() {
    if (this.$route.query && this.$route.query.query) {
      this.search = this.$route.query.query;
      await this.doSearch();
    }

    this.date = moment().format("YYYY-MM-DD");
  },
  computed: {
    searchValue() {
      if (this.searched && this.searched.length > 0) {
        return cleanCoding(this.searched);
      }

      return "";
    },
  },
  methods: {
    ...mapActions("authority/formB", ["accountSearch"]),
    searchKeyUp(event) {
      if (event.key == "Enter") this.doSearch();
    },
    async doSearch() {
      this.searchResults = [];

      let cleanSearch = (this.search = cleanCoding(this.search));
      if (cleanSearch.length == 0) return;

      this.loading = true;
      this.responseErrors = undefined;
      this.searched = cleanSearch;

      this.searchResults = await this.accountSearch({ term: cleanSearch.replace(/-/g, ""), date: this.date })
        .catch((e) => {
          this.responseErrors = e.response.data.errors[0].msg;
        })
        .finally(() => {
          this.loading = false;
        });
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
