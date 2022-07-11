<template>
  <v-container fluid class="down-top-padding">
    <BaseBreadcrumb
      :title="page.title"
      :icon="page.icon"
      :breadcrumbs="breadcrumbs"
    >
      <template v-slot:right>
        <!-- <timed-message ref="messager" class="mr-4"></timed-message> -->
      </template>
    </BaseBreadcrumb>

    <BaseCard showHeader="true">
      <v-data-table
        :items="departments"
        :headers="[
          { text: 'Code', value: 'dept' },
          { text: 'Description', value: 'descr' },
          { text: 'Form A Lines', value: 'form_a_count' },
          { text: 'Active Form B\'s', value: 'form_b_count' },
        ]"
        :search="search"
        class="row-clickable"
        @click:row="openDepartment"
        :loading="loading"
      >
      </v-data-table>

      <template v-slot:left>
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Search"
          single-line
          hide-details
        ></v-text-field>
      </template>
      <template v-slot:right> </template>
    </BaseCard>
  </v-container>
</template>


<script>
import { mapActions, mapState } from "vuex";

export default {
  name: "DepartmentList",
  data: () => ({
    search: "",
    drawer: null,
    searchResults: [],
    loading: false,
    page: {
      title: "Departments",
    },
    breadcrumbs: [
      {
        text: "Signing Authorities Home",
        to: "/dashboard",
      },
      {
        text: "Departments",
        disabled: true,
      },
    ],
    items: [],
  }),
  mounted: function () {
    this.loadDepartments()
    //this.loadList();
  },
  computed: {
    ...mapState("department", ["departments"]),
  },

  methods: {
    ...mapActions("department", ["loadDepartments"]),
    openDepartment(item) {
      this.$router.push(`/departments/${item.dept}`);
    },
    async loadList() {
      this.items = await this.loadDepartments();
    },
  },
};
</script>

