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
        <v-select
          class="ml-5"
          :items="statusOptions"
          v-model="statusFilter"
          label="Status"
          single-line
          hide-details
          @change="filterList"
        ></v-select>
      </template>
      <template v-slot:right>
        <create-form-a-button
          :department="item"
          :programList="programList"
          :activityList="activityList"
        ></create-form-a-button>
      </template>

      <v-row>
        <v-col>
          <v-card class="default">
            <v-card-title>Delegations by Position</v-card-title>
            <v-card-text>
              <v-row>
                <v-col>
                  <v-select
                    label="Filter Program"
                    v-model="programFilter"
                    :items="programListAny"
                    @change="programChanged"
                    dense
                    outlined
                    background-color="white"
                  />
                </v-col>
                <v-col>
                  <v-select
                    label="Filter Activity"
                    v-model="activityFilter"
                    :items="activityListAny"
                    @change="filterList"
                    :disabled="programFilter == 'All'"
                    dense
                    outlined
                    background-color="white"
                  />
                </v-col>
                <v-col>
                  <v-btn :disabled="!canGenerate" color="secondary" class="my-0" @click="generateFormAClick"
                    >Generate Form A</v-btn
                  ></v-col
                >
              </v-row>

              <v-data-table
                :headers="headers"
                :search="search"
                :items="matchingItems"
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
        <v-card-text class="pt-3">
          <p v-if="programFilter == 'All'">
            This will generate a new Form A that includes all
            <strong>'Non Archived'</strong> position records.
          </p>
          <p v-else-if="activityFilter != 'All'">
            This will generate a new Form A that includes all
            <strong>'Non Archived'</strong> position records within the <strong>'{{ activityFilter }}'</strong> Activity
            of <strong>'{{ programFilter }}'</strong>.
          </p>
          <p v-else>
            This will generate a new Form A that includes all
            <strong>'Non Archived'</strong> position records within the <strong>'{{ programFilter }}'</strong> Program.
          </p>
          <p>The following {{ matchingItems.length }} position(s) will be included:</p>
          <ul class="mb-3">
            <li v-for="(item, idx) of matchingItems" :key="idx">
              {{ item.position }}
            </li>
          </ul>

          <p>
            When you click 'Proceed' below, these positions will be placed into a 'Locked' state. You may then download
            the Form A PDF for approval and signatures. Once this is complete, you must upload the signed PDF to make
            these Delegations active.
          </p>

          <v-btn color="primary" class="mb-0" @click="doGenerateFormA">Proceed</v-btn>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
/*------ TODO ------*/
// tidy up HTML code and break into multiple components
import _ from "lodash";
import { mapActions, mapGetters, mapState } from "vuex";
import createFormAButton from "../../forms/formA/components/createFormAButton.vue";

export default {
  components: { createFormAButton },
  name: "DepartmentDetail",
  componenets: {
    createFormAButton,
  },
  data: () => ({
    search: "",
    statusFilter: "Any",
    drawer: null,
    searchResults: [],
    loading: false,
    headers: [
      { text: "Program", value: "program_branch" },
      { text: "Activity", value: "activity" },
      { text: "Position", value: "position" },
      { text: "Status", value: "status" },
      { text: "Reviewed", value: "reviewed_by_department" },
    ],
    page: {
      title: "Delegations by Position",
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
        text: "Delegations by Position",
        disabled: true,
      },
    ],
    statusOptions: ["Any", "Active", "Inactive"],
    allItems: [],
    formAItems: [],
    item: {},
    departmentId: null,
    programList: [],
    activityList: [],

    programFilter: "All",
    activityFilter: "All",
    matchingItems: [],

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
    ...mapGetters("department", ["getDepartmentDetails"]),

    programListAny() {
      let list = _.clone(this.programList);
      list.unshift("All");
      return list;
    },
    activityListAny() {
      let list = [];

      for (let item of this.allItems.filter((i) => i.program_branch == this.programFilter)) {
        if (item.activity) list.push(item.activity);
      }

      list = _.uniq(list);

      list.unshift("All");
      return list;
    },
    canGenerate() {
      if (this.matchingItems.length == 0) return false;

      let allArchived = true;
      let allLocked = true;

      for (let item of this.matchingItems) {
        if (item.status != "Archived") {
          allArchived = false;
        }
        if (item.status != "Locked") {
          allLocked = false;
        }
      }

      if (allArchived || allLocked) return false;

      return true;
    },
  },
  methods: {
    ...mapActions("department", [
      "getDepartment",
      "getFormAList",
      "getProgramList",
      "getActivityList",
      "generateFormA",
    ]),
    openBranchFormA: function(branchName) {
      this.$router.push("/departments/" + this.departmentId + "/positions/branch/" + branchName);
    },
    programChanged() {
      this.activityFilter = "All";
      this.filterList();
    },
    filterList() {
      let list = _.clone(this.allItems);

      if (this.statusFilter != "Any") {
        list = list.filter((i) => {
          if (this.statusFilter == "Active" && i.status == "Active") return true;
          else if (this.statusFilter == "Inactive" && i.status.indexOf("Inactive") == 0) return true;

          return false;
        });
      }

      if (this.programFilter != "All") {
        list = list.filter((i) => i.program_branch == this.programFilter);
      }

      if (this.activityFilter != "All") {
        list = list.filter((i) => i.activity == this.activityFilter);
      }

      this.matchingItems = list;
    },
    async loadFormA() {
      this.allItems = this.formAItems = await this.getFormAList({
        id: this.departmentId,
      });

      this.programList = await this.getProgramList({
        id: this.departmentId,
      });

      this.activityList = await this.getActivityList({
        id: this.departmentId,
      });

      this.filterList();
      this.loadingFormA = false;
    },
    openFormA(item) {
      this.$router.push(`/departments/${this.departmentId}/positions/${item._id}`);
    },
    generateFormAClick() {
      this.statusFilter = "Any";
      this.filterList();
      this.showGenerateDialog = true;
    },
    async doGenerateFormA() {
      let items = this.matchingItems.map((i) => i._id);

      let answer = await this.generateFormA({
        id: this.departmentId,
        items,
        program: this.programFilter,
        activity: this.activityFilter,
        department_descr: this.item.descr,
      });

      this.$router.push(`/departments/${this.departmentId}/form-a/${answer}`);
    },
  },
};
</script>
