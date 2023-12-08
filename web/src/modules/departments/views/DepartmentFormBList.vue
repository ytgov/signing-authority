<template>
  <v-container fluid class="down-top-padding">
    <BaseBreadcrumb :title="page.title" :icon="page.icon" :breadcrumbs="breadcrumbs">
      <template v-slot:right>
        <!-- <timed-message ref="messager" class="mr-4"></timed-message> -->
      </template>
    </BaseBreadcrumb>

    <BaseCard :showHeader="true">
      <template v-slot:left>Form B Authorizations </template>
      <template v-slot:right>
        <create-form-b :department="item" v-if="canAdminister"></create-form-b>
      </template>

      <v-card class="default">
        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="search"
                prepend-inner-icon="mdi-magnify"
                label="Search"
                clearable
                outlined
                dense
                hide-details
                background-color="white"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                label="Status"
                prepend-inner-icon="mdi-clock"
                v-model="statusFilter"
                :items="['Any', 'Active', 'Approved', 'Pending', 'Scheduled', 'Inactive', 'Cancelled']"
                @change="filterList"
                outlined
                dense
                hide-details
                background-color="white"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                label="Program"
                prepend-inner-icon="mdi-filter"
                v-model="programFilter"
                :items="programListAny"
                @change="programChanged"
                dense
                outlined
                hide-details
                background-color="white"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                label="Activity"
                prepend-inner-icon="mdi-filter"
                v-model="activityFilter"
                :items="activityListAny"
                @change="filterList"
                :disabled="programFilter == 'All'"
                dense
                outlined
                hide-details
                background-color="white"
              />
            </v-col>
          </v-row>

          <v-data-table
            class="mt-5 row-clickable"
            :headers="headers"
            :search="search"
            :items="formBItems"
            :loading="loadingFormB"
            @click:row="openFormB"
            dense
            :footer-props="{
              'items-per-page-options': [25, 50, 75, -1],
            }"
            :items-per-page="50"
          >
            <template v-slot:item.authority_type="{ item }">
              {{ convertType(item.authority_type) }}
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>
    </BaseCard>
  </v-container>
</template>

<script>
import { mapActions, mapState } from "vuex";
import { clone, uniq, isEmpty } from "lodash";
import createFormB from "@/modules/forms/formB/components/createFormB.vue";

export default {
  components: { createFormB },
  name: "DepartmentDetail",
  data: () => ({
    search: "",
    drawer: null,
    searchResults: [],
    loading: false,
    page: {
      title: "Form B Authorizations",
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
        text: "Form B Authorizations",
        disabled: true,
      },
    ],

    headers: [
      { text: "Position", value: "employee.title" },
      { text: "Employee", value: "employee.name" },
      { text: "Status", value: "status" },
      { text: "Type", value: "authority_type" },
    ],

    item: {},
    departmentId: "",
    statusFilter: "",
    programList: [],
    activityList: [],

    programFilter: "All",
    activityFilter: "All",

    allItems: [],
    formBItems: [],
    loadingFormB: false,
    formBLink: "",
  }),
  mounted: async function() {
    this.departmentId = this.$route.params.departmentId;
    this.item = await this.getDepartment({ id: this.departmentId });
    this.loadingFormB = true;

    this.breadcrumbs[1].to = `/departments/${this.departmentId}`;
    this.breadcrumbs[1].text = this.item.descr;

    this.formBLink = `/departments/${this.departmentId}/form-b`;

    let status = this.$route.query.status || "";
    let savedSearch = localStorage.getItem("FormB_search");

    if (status) {
      this.statusFilter = status;
      this.search = null;
      localStorage.setItem("FormB_search", null);
    } else {
      let savedStatus = localStorage.getItem("FormB_statusFilter");
      this.statusFilter = savedStatus ?? "Any";
      if (!isEmpty(savedSearch)) {
        this.search = savedSearch;
      }
    }

    let programFilt = localStorage.getItem("programFilter");
    let activityFilt = localStorage.getItem("activityFilter");

    if (!isEmpty(programFilt)) {
      this.programFilter = programFilt;
      if (!isEmpty(activityFilt)) this.activityFilter = activityFilt;
    }

    this.allItems = await this.getFormBList({ id: this.departmentId });

    this.programList = await this.getProgramList({
      id: this.departmentId,
    });

    console.log(this.programList);

    this.activityList = await this.getActivityList({
      id: this.departmentId,
    });

    this.filterList();
    this.loadingFormB = false;
  },
  watch: {
    search(newVal) {
      if (isEmpty(newVal)) localStorage.removeItem("FormB_search");
      else localStorage.setItem("FormB_search", newVal);
    },
    statusFilter(newVal) {
      localStorage.setItem("FormB_statusFilter", newVal);
    },
    programFilter(newVal) {
      localStorage.setItem("programFilter", newVal);
    },
    activityFilter(newVal) {
      localStorage.setItem("activityFilter", newVal);
    },
  },
  computed: {
    ...mapState("home", ["profile"]),

    canAdminister() {
      if (this.profile && this.profile.roles && this.profile.roles.length > 0) {
        if (this.profile.roles.includes("System Admin")) return true;

        if (
          this.profile.roles.includes("Form B Administrator") &&
          this.profile.department_admin_for.includes(this.departmentId)
        )
          return true;
      }

      return false;
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
  },
  methods: {
    ...mapActions("department", ["getDepartment", "getFormBList", "getProgramList", "getActivityList"]),
    openFormB(item) {
      this.$router.push({
        name: "FormBDetails",
        params: { formBId: item._id },
      });
    },
    programChanged() {
      this.activityFilter = "All";
      this.filterList();
    },
    filterList() {
      let list = clone(this.allItems);

      let pendingStates = ["Inactive (Locked for Signatures)", "Inactive (Finance Approve)"];

      if (this.statusFilter && this.statusFilter != "Any") {
        list = list.filter((i) => {
          if (i.status == this.statusFilter) return true;
          else if (this.statusFilter == "Inactive" && i.status.indexOf("Inactive") >= 0) return true;
          else if (this.statusFilter == "Scheduled" && i.status.indexOf("Scheduled") >= 0) return true;
          else if (this.statusFilter == "Pending" && pendingStates.indexOf(i.status) >= 0) return true;
          else if (this.statusFilter == "Approved" && i.status.indexOf("Approved") >= 0) return true;

          return false;
        });
      }

      if (this.programFilter != "All") {
        console.log("FILTER ON ", this.programFilter);
        list = list.filter((i) => i.program_branch == this.programFilter);
      }

      if (this.activityFilter != "All") {
        list = list.filter((i) => i.activity == this.activityFilter);
      }

      this.formBItems = list;
    },
    convertType(input) {
      if (input == "temporary") return "Temporary";
      if (input == "acting") return "Acting";
      return "Substantive";
    },
  },
};
</script>
