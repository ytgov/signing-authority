<template>
  <v-container fluid class="down-top-padding">
    <BaseBreadcrumb :title="page.title" :icon="page.icon" :breadcrumbs="breadcrumbs">
      <template v-slot:right>
        <!-- <timed-message ref="messager" class="mr-4"></timed-message> -->
      </template>
    </BaseBreadcrumb>

    <BaseCard :showHeader="true">
      <template v-slot:left>
        <v-text-field v-model="search" append-icon="mdi-magnify" label="Search" single-line hide-details></v-text-field>
      </template>

      <v-row>
        <v-col>
          <v-card class="default">
            <v-card-title>Pending Form As</v-card-title>
            <v-card-text>
              <v-data-table
                :headers="headers"
                :search="search"
                :items="items"
                @click:row="openFormA"
                class="row-clickable"
                :footer-props="{
                  'items-per-page-options': [25, 50, 75, -1],
                }"
                :items-per-page="50"
              >
              </v-data-table>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </BaseCard>

    <v-dialog v-model="showGenerateDialog" persistent width="600">
      <v-app-bar dark color="#0097A9">
        <v-toolbar-title>Gererate Form A</v-toolbar-title>
        <v-spacer />
        <v-icon title="Close" @click="showGenerateDialog = false">mdi-close</v-icon>
      </v-app-bar>
      <v-card tile>
        <v-card-text class="pt-3"> </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { mapActions, mapState } from "vuex";

export default {
  components: {},
  name: "DepartmentPendingGroups",
  data: () => ({
    search: "",
    loading: false,
    headers: [
      { text: "Created by", value: "created_by" },
      { text: "Date", value: "create_date_display" },
      { text: "Program", value: "program" },
      { text: "Activity", value: "activity" },
      { text: "Status", value: "status" },
      { text: "Positions", value: "positions.length" },
    ],
    page: {
      title: "Pending Form As",
    },
    breadcrumbs: [
      {
        text: "Signing Authorities Home",
        to: "/dashboard",
      },
      {
        text: "",
        to: "",
        exact: true,
      },
      {
        text: "Pending Form As",
        disabled: true,
      },
    ],

    items: [],
    departmentId: null,
    showGenerateDialog: false,
  }),
  mounted: async function() {
    this.departmentId = this.$route.params.departmentId;
    this.item = await this.getDepartment({ id: this.departmentId });

    this.breadcrumbs[1].to = `/departments/${this.departmentId}`;
    this.breadcrumbs[1].text = this.item.descr;

    this.loadFormA();
  },
  watch: {},
  computed: {
    ...mapState("department", ["departments"]),

    canGenerate() {
      if (this.matchingItems.length == 0) return false;

      let allArchived = true;

      for (let item of this.matchingItems) {
        if (item.status != "Archived") {
          allArchived = false;
          break;
        }
      }

      if (allArchived) return false;

      return true;
    },
  },
  methods: {
    ...mapActions("department", ["getDepartment", "getPendingGroups"]),
    async loadFormA() {
      this.items = this.formAItems = await this.getPendingGroups({
        id: this.departmentId,
      });

      this.loading = false;
    },
    openFormA(item) {
      this.$router.push(`/departments/${this.departmentId}/form-a/${item._id}`);
    },
    generateFormAClick() {
      this.showGenerateDialog = true;
    },
    async doGenerateFormA() {
      console.log("ANSWER");
    },
  },
};
</script>
