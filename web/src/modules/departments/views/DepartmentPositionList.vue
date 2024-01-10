<template>
  <v-container fluid class="down-top-padding">
    <BaseBreadcrumb :title="page.title" :icon="page.icon" :breadcrumbs="breadcrumbs">
      <template v-slot:right>
        <!-- <timed-message ref="messager" class="mr-4"></timed-message> -->
      </template>
    </BaseBreadcrumb>

    <BaseCard :showHeader="true">
      <template v-slot:left>
        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          clearable
          label="Search"
          single-line
          hide-details
        ></v-text-field>
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
          v-if="canAdminister"
          :department="item"
          :programList="programList"
          :activityList="activityList"
          :listLength="allItems.length"
          :activeDMExists="activeDMExists"
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
                  <v-btn
                    :disabled="!canGenerate"
                    color="secondary"
                    class="my-0"
                    @click="generateFormAClick"
                    v-if="canAdminister"
                    >Generate Form A</v-btn
                  ></v-col
                >
              </v-row>

              <v-data-table
                :headers="headers"
                :search="search"
                :items="matchingItems"
                :loading="loading"
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
        <v-toolbar-title>Generate Form A</v-toolbar-title>
        <v-spacer />
        <v-icon title="Close" @click="closeGenerateDialog">mdi-close</v-icon>
      </v-app-bar>
      <v-card tile>
        <v-card-text class="pt-3">
          <!-- <p v-if="programFilter == 'All'">
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
          </p> -->
          <p class="mb-1">The following {{ generateFormAList.length }} position(s) will be included:</p>
          <p style="color: #323232cc !important">
            Drag the <v-icon small>mdi-arrow-expand-vertical</v-icon> icon to reorder positions and click the
            <v-icon small color="warning">mdi-close</v-icon> to remove positions.
          </p>

          <v-list dense>
            <draggable v-model="generateFormAList" handle=".handle">
              <div v-for="(item, idx) of generateFormAList" :key="idx">
                <v-divider></v-divider>
                <v-list-item>
                  <v-list-item-action style="cursor:pointer" title="Drag to reorder" class="handle">
                    <v-icon>mdi-arrow-expand-vertical</v-icon>
                  </v-list-item-action>
                  <v-list-item-content>
                    {{ makeFullName(item) }}
                  </v-list-item-content>
                  <v-list-item-icon>
                    <v-btn color="warning" class="my-0" small icon @click="removeMatchingItem(idx)"
                      ><v-icon>mdi-close</v-icon></v-btn
                    >
                  </v-list-item-icon>
                </v-list-item>
              </div>
            </draggable>
          </v-list>

          <p>By clicking 'Proceed' below, these positions will be locked from further edits.</p>
          <p>A notification will be sent to the Department of Finance to review the form.</p>

          <v-btn color="primary" class="mb-0" @click="doGenerateFormA" :disabled="generateFormAList.length == 0"
            >Proceed</v-btn
          >
          <v-btn
            color="secondary"
            class="mb-0 ml-5"
            @click="doGeneratePreview"
            :disabled="generateFormAList.length == 0"
            >Form A Preview</v-btn
          >
        </v-card-text>
      </v-card>
    </v-dialog>

    <pdf-preview-dialog ref="pdfPreview"></pdf-preview-dialog>
  </v-container>
</template>

<script>
/*------ TODO ------*/
// tidy up HTML code and break into multiple components
import { cloneDeep, clone, uniq, orderBy, isEmpty } from "lodash";
import { mapActions, mapGetters, mapState } from "vuex";
import createFormAButton from "../../forms/formA/components/createFormAButton.vue";
import PdfPreviewDialog from "@/components/PdfPreviewDialog.vue";
import { FORMA_URL } from "@/urls";

import draggable from "vuedraggable";

export default {
  components: { createFormAButton, PdfPreviewDialog, draggable },
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
    statusOptions: ["Any", "Active", "Locked", "Inactive", "Archived"],
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
    generateFormAList: [],
  }),
  mounted: async function() {
    this.loading = true;
    this.departmentId = this.$route.params.departmentId;
    this.item = await this.getDepartment({ id: this.departmentId });

    this.breadcrumbs[1].to = `/departments/${this.departmentId}`;
    this.breadcrumbs[1].text = this.item.descr;

    await this.loadFormA();

    let status = this.$route.query.status || "";
    let savedSearch = localStorage.getItem("Position_search");

    if (status) {
      this.statusFilter = status;
      this.search = null;
      localStorage.setItem("Position_search", null);
    } else {
      let savedStatus = localStorage.getItem("Position_statusFilter");
      this.statusFilter = savedStatus ?? "Any";
      if (savedSearch && savedSearch.length > 0) this.search = savedSearch;
    }

    let programFilt = localStorage.getItem("programFilter");
    let activityFilt = localStorage.getItem("activityFilter");

    if (!isEmpty(programFilt)) {
      this.programFilter = programFilt;
      if (!isEmpty(activityFilt)) this.activityFilter = activityFilt;
    }

    this.filterList();

    this.loading = false;
  },
  watch: {
    search(newVal) {
      localStorage.setItem("Position_search", newVal);
    },
    statusFilter(newVal) {
      localStorage.setItem("Position_statusFilter", newVal);
    },
    programFilter(newVal) {
      localStorage.setItem("programFilter", newVal);
    },
    activityFilter(newVal) {
      localStorage.setItem("activityFilter", newVal);
    },
  },
  computed: {
    ...mapState("department", ["departments"]),
    ...mapGetters("department", ["getDepartmentDetails"]),
    ...mapState("home", ["profile"]),

    canAdminister() {
      if (this.profile && this.profile.roles && this.profile.roles.length > 0) {
        if (this.profile.roles.includes("System Admin")) return true;

        if (
          this.profile.roles.includes("Form A Administrator") &&
          this.profile.department_admin_for.includes(this.departmentId)
        )
          return true;
      }

      return false;
    },

    activeDMExists() {
      let activeDm = this.allItems.filter((a) => a.is_deputy_minister && a.status == "Active");
      return activeDm.length > 0;
    },

    programListAny() {
      let list = clone(this.programList);
      list.unshift("All");
      return list;
    },
    activityListAny() {
      let list = [];

      for (let item of this.allItems.filter((i) => i.program_branch == this.programFilter)) {
        if (item.activity) list.push(item.activity);
      }

      list = uniq(list);

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
    filterList(excludeArchived = false) {
      let list = clone(this.allItems);

      if (this.statusFilter != "Any") {
        list = list.filter((i) => {
          if (this.statusFilter == "Active" && i.status == "Active") return true;
          else if (this.statusFilter == "Inactive" && i.status.indexOf("Inactive") == 0) return true;
          else if (this.statusFilter == "Locked" && i.status.indexOf("Locked") == 0) return true;
          else if (this.statusFilter == "Archived" && i.status == "Archived") return true;

          return false;
        });
      }

      if (this.programFilter != "All") {
        list = list.filter((i) => i.program_branch == this.programFilter);
      }

      if (this.activityFilter != "All") {
        list = list.filter((i) => i.activity == this.activityFilter);
      }

      if (excludeArchived == true) {
        list = list.filter((i) => i.status != "Archived");
        list = list.filter((i) => !i.is_deputy_duplicate);
        list = list.filter((i) => !i.is_deputy_minister);
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
      this.generateFormAList = cloneDeep(this.matchingItems);
      this.generateFormAList = this.generateFormAList.filter((i) => i.status != "Archived");
      this.generateFormAList = this.generateFormAList.filter((i) => !i.is_deputy_duplicate);
      this.generateFormAList = this.generateFormAList.filter((i) => !i.is_deputy_minister);

      this.generateFormAList = orderBy(this.generateFormAList, [
        "program_branch",
        "activity",
        "position",
        "created_on",
      ]);
      this.showGenerateDialog = true;
    },
    async doGenerateFormA() {
      let items = this.generateFormAList.map((i) => i._id);

      let answer = await this.generateFormA({
        id: this.departmentId,
        items,
        program: this.programFilter,
        activity: this.activityFilter,
        department_descr: this.item.descr,
      });

      this.$router.push(`/departments/${this.departmentId}/form-a/${answer}`);
    },

    async doGeneratePreview() {
      let ids = this.generateFormAList.map((i) => i._id).join(",");
      let previewUrl = `${FORMA_URL}/temp-pdf-preview?ids=${ids}&department_code=${this.departmentId}&department_descr=${this.item.descr}&program=${this.programFilter}&activity=${this.activityFilter}`;
      this.$refs.pdfPreview.show("Form A Preview", previewUrl);
    },

    removeMatchingItem(index) {
      this.generateFormAList.splice(index, 1);
    },

    closeGenerateDialog() {
      this.showGenerateDialog = false;
      this.filterList();
    },
    makeFullName(item) {
      if (item.program_branch && item.activity) {
        return `${item.program_branch} : ${item.activity} - ${item.position}`;
      }
      if (item.program_branch) return `${item.program_branch} - ${item.position}`;
      if (item.activity) return `${item.activity} - ${item.position}`;

      return item.position;
    },
  },
};
</script>
