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
      </template>
      <template v-slot:right> </template>

      <v-row>
        <v-col>
          <v-card class="default">
            <v-card-title>Form A Authorizations</v-card-title>
            <v-card-text>
              <v-data-table
                :headers="[{ text: 'Position', value: 'position' }]"
                :search="search"
                :items="formAItems"
                :loading="loadingFormA"
                 @click:row="openFormA"
              >
              </v-data-table>
              <div class="mt-4 ml-2">
                <router-link :to="formALink">View all</router-link>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col>
          <v-card class="default">
            <v-card-title>Active Form B Authorizations</v-card-title>
            <v-card-text>
              <v-row>
                <v-col>
                  <v-card>
                    <v-card-text class="text-h4 mb-0 pb-0">123</v-card-text>
                    <v-card-text class="mt-0 pt-0">Active</v-card-text>
                  </v-card>
                </v-col>
                <v-col>
                  <v-card>
                    <v-card-text class="text-h4 mb-0 pb-0">123</v-card-text>
                    <v-card-text class="mt-0 pt-0">Acting</v-card-text>
                  </v-card>
                </v-col>
              </v-row>

              <v-data-table
                class="mt-5"
                :headers="[
                  { text: 'Employee', value: 'name' },
                  { text: 'Position', value: 'position' },
                ]"
                :search="search"
                :items="formBItems"
                :loading="loadingFormB"
                @click:row="openFormB"
              >
              </v-data-table>

              <div class="mt-4 ml-2">
                <router-link :to="formBLink">View all</router-link>
              </div>
            </v-card-text>
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
      title: "Departments",
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
        disabled: true,
      },
    ],
    formALink: "",
    formBLink: "",

    item: {},
    loadingFormA: true,
    loadingFormB: true,
    formAItems: [],
    formBItems: [],
    selectedId: null,
  }),
  mounted: function () {
    this.selectedId = this.$route.params.id;
    this.formALink = `/departments/${this.selectedId}/form-a`;
    this.formBLink = `/departments/${this.selectedId}/form-b`;
    this.loadList();
  },
  computed: {
    ...mapState("department", ["departments"]),
  },

  methods: {
    ...mapActions("department", [
      "getDepartment",
      "getFormAList",
      "getFormBList",
    ]),
    openDepartment(item) {
      this.$router.push(`/departments/${item.dept}`);
    },
    async loadList() {
      this.item = await this.getDepartment({ id: this.selectedId });

      if (this.item && this.item.dept) {
        this.breadcrumbs[2].text = this.item.descr;
        this.page.title = this.item.descr;
        this.loadFormA();
        this.loadFormB();
      }
    },
    async loadFormA() {
      this.formAItems = await this.getFormAList({ id: this.selectedId });
      this.loadingFormA = false;
    },
    async loadFormB() {
      this.formBItems = await this.getFormBList({ id: this.selectedId });
      this.loadingFormB = false;
    },
    openFormA(item) {
      this.$router.push(`${this.formALink}/${item._id}`)
    },
    openFormB(item) {
      this.$router.push(`/employee/${item._id}/form-b/${item._id}`)
    },
  },
};
</script>
