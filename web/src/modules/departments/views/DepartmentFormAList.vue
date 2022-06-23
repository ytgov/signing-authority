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
      <template v-slot:left>
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Search"
          single-line
          hide-details
        ></v-text-field>
        <v-select
        class="ml-5"
          :items="statusOptions"
          label="Status"
          single-line
          hide-details
        ></v-select>
      </template>
      <template v-slot:right>
        <v-btn color="primary">Add Form A</v-btn>
      </template>

      <v-row>
        <v-col>
          <v-card class="default">
            <v-card-title>Form A Authorizations</v-card-title>
            <v-card-text>
              <v-data-table
                :headers="[{ text: 'Position', value: 'position' }]"
                :search="search"
                :items="formAItems"
                @click:row="openFormA"
              >
              </v-data-table
            ></v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </BaseCard>
  </v-container>
</template>


<script>
import { mapActions, mapState } from "vuex";

export default {
  name: "DepartmentDetail",
  data: () => ({
    search: "",
    drawer: null,
    searchResults: [],
    loading: false,
    page: {
      title: "Form A Authorizations",
    },
    breadcrumbs: [
      {
        text: "Signing Authorities Home",
        to: "/dashboard",
      },
      {
        text: "Departments",
        to: "/departments",
        exact: true,
      },
      {
        text: "",
        to: "",
        exact: true,
      },
      {
        text: "Form A Authorizations",
        disabled: true,
      },
    ],
    statusOptions: ["Active", "Inactive"],
    formAItems: [],
    item: {},
    selectedId: null,
  }),
  mounted: async function () {
    this.selectedId = this.$route.params.id;
    this.item = await this.getDepartment({ id: this.selectedId });

    this.breadcrumbs[2].to = `/departments/${this.selectedId}`;
    this.breadcrumbs[2].text = this.item.descr;

    //this.items = this.loadList();
    this.loadFormA();
  },
  computed: {
    ...mapState("department", ["departments"]),
  },

  methods: {
    ...mapActions("department", ["getDepartment", "getFormAList"]),
    openDepartment(item) {
      this.$router.push(`/departments/${item.dept}`);
    },
    async loadList() {
      /* this.item = await this.getDepartment({ id: this.selectedId });

      if (this.item && this.item.dept) {
        this.breadcrumbs[2].text = this.item.descr;
      } */
    },
    async loadFormA() {
      this.formAItems = await this.getFormAList({ id: this.selectedId });
      this.loadingFormA = false;
    },
    openFormA(item) {
      this.$router.push(`/departments/${this.selectedId}/form-a/${item._id}`)
    },
  },
};
</script>
