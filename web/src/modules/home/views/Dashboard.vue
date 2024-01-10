<template>
  <div class="home">
    <h1>Signing Authorities Home</h1>

    <v-row>
      <v-col cols="12" md="6">
        <employee-search></employee-search>

        <v-card color="#fff2d5" class="mb-6" style="height: 140px">
          <v-card-title>Authorities by Account Code</v-card-title>
          <v-card-text>
            <v-text-field
              dense
              outlined
              background-color="white"
              label="Enter a posting level account"
              append-icon="mdi-magnify"
              @click:append="doCodeSearch"
              @keydown="codeSearchKeyUp"
              hint="Enter a posting level account and press Enter"
              v-model="codeSearch"
              class="mb-2"
            ></v-text-field>
          </v-card-text>
        </v-card>
        <my-authorities></my-authorities>
      </v-col>
      <v-col cols="12" md="6">
        <v-card class="mb-6" color="#fff2d5" style="height: 140px">
          <v-card-title>Authorities by Department</v-card-title>
          <v-card-text>
            <v-autocomplete
              class="mb-4"
              dense
              outlined
              background-color="white"
              :items="departments"
              item-text="display_name"
              item-value="dept"
              hide-details
              label="Select department"
              @change="selectDepartment"
              :search-input.sync="searchTerm"
              @keyup.enter="shortCutSelectDepartment(searchTerm)"
            >
            </v-autocomplete>

            <!-- <router-link to="/departments">View all</router-link> -->
          </v-card-text>
        </v-card>

        <actions-card></actions-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { mapState } from "vuex";
import EmployeeSearch from "../components/EmployeeSearch.vue";
import ActionsCard from "../components/ActionsCard.vue";
import MyAuthorities from "../components/MyAuthoritiesCard.vue";

export default {
  name: "Home",
  components: { EmployeeSearch, ActionsCard, MyAuthorities },
  data: () => ({
    search: "",
    codeSearch: "",
    searchTerm: null,
  }),
  computed: {
    ...mapState("department", ["departments"]),
  },
  methods: {
    shortCutSelectDepartment(searchInput) {
      if (this.departments.filter((department) => department.dept === searchInput).length === 1) {
        this.selectDepartment(searchInput);
      }
    },
    selectDepartment(item) {
      this.$router.push(`/departments/${item}`);
    },
    codeSearchKeyUp(event) {
      if (event.key == "Enter") this.doCodeSearch();
    },
    async doCodeSearch() {
      let cleanSearch = this.codeSearch.trim().toLowerCase();
      if (cleanSearch.length == 0) return;

      this.$router.push(`/code-search?query=${cleanSearch}`);
    },
  },
};
</script>
