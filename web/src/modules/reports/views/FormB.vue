<template>
  <v-container fluid class="down-top-padding">
    <BaseBreadcrumb title="Form B Reporting" :breadcrumbs="breadcrumbs"> </BaseBreadcrumb>

    <!-- <h2>Form B List</h2> -->
    <v-card class="mb-6 default" :disabled="isLoading">
      <v-progress-linear v-if="isLoading" color="warning" height="4" indeterminate></v-progress-linear>
      <div v-else style="height: 4px"></div>

      <div></div>

      <v-card-text>
        <v-row class="mb-3">
          <v-col cols="12" md="8">
            <v-text-field
              v-model="search"
              label="Search"
              dense
              outlined
              background-color="white"
              hide-details
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="4">
            <v-select
              label="Status"
              prepend-inner-icon="mdi-clock"
              v-model="selectedStatus"
              :items="['Any', 'Active', 'Approved', 'Pending', 'Scheduled', 'Inactive', 'Cancelled']"
              @change="filterChanged"
              outlined
              dense
              hide-details
              background-color="white"
            />
          </v-col>

          <v-col cols="12" md="8">
            <v-autocomplete
              class="mb-4"
              dense
              outlined
              background-color="white"
              :items="departments"
              item-text="display_name"
              item-value="dept"
              hide-details
              multiple
              label="Departments"
              v-model="selectedDepartments"
              @change="filterChanged"
            >
            </v-autocomplete>
          </v-col>
          <v-col>
            <v-select
              label="Authority type"
              prepend-inner-icon="mdi-cogs"
              v-model="selectedTypes"
              multiple
              :items="['Substantive', 'Temporary', 'Acting']"
              @change="filterChanged"
              outlined
              dense
              hide-details
              background-color="white"
            />
          </v-col>
        </v-row>

        <v-data-table :search="search" :items="filteredList" :headers="headers" dense>
          <template v-slot:item.actions="{ item }">
            <v-icon color="success" @click="openItem(item)">mdi-link-variant</v-icon>
          </template>
        </v-data-table>

        <v-btn color="primary" class="mb-0" @click="downloadClick">Export CSV</v-btn>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import { mapActions, mapState } from "vuex";
import { clone } from "lodash";
import { makeCSV, saveCSVFile } from "@/utils/outputs";

export default {
  data: () => ({
    breadcrumbs: [{ text: "Reports Home", to: "/reports", exact: true }, { text: "Form B Reporting" }],
    headers: [
      { text: "Department", value: "department_descr" },
      { text: "Type", value: "authority_type" },
      { text: "Position", value: "employee.title" },
      { text: "Employee", value: "employee.name" },
      { text: "Status", value: "status" },
      { text: "", value: "actions", width: "60" },
    ],

    filteredList: [],
    selectedDepartments: [],
    selectedStatus: "Any",
    selectedTypes: [],
    search: "",
  }),
  computed: {
    ...mapState("reports", ["isLoading", "formBList"]),
    ...mapState("department", ["departments"]),
  },
  async mounted() {
    await this.loadFormBList();
    this.filterChanged();
  },

  methods: {
    ...mapActions("reports", ["loadFormBList"]),
    async downloadClick() {
      let csvData = this.filteredList.map((i) => {
        return {
          department_code: i.department_code,
          department: i.department_descr,
          program: i.program_branch,
          activity: i.activity,
          authority_type: i.authority_type,
          position: i.employee.title,
          employee: i.employee.name,
          status: i.status,
        };
      });

      let csv = makeCSV(csvData);
      saveCSVFile(csv, "formb-report.csv");
    },
    shortCutSelectDepartment(searchInput) {
      if (this.departments.filter((department) => department.dept === searchInput).length === 1) {
        this.selectDepartment(searchInput);
      }
    },
    filterChanged() {
      let list = clone(this.formBList);
      let pendingStates = ["Inactive (Locked for Signatures)", "Inactive (Finance Approve)"];

      if (this.selectedDepartments && this.selectedDepartments.length > 0) {
        list = list.filter((i) => this.selectedDepartments.includes(i.department_code));
      }

      if (this.selectedTypes && this.selectedTypes.length > 0) {
        list = list.filter((i) => this.selectedTypes.includes(i.authority_type));
      }

      if (this.selectedStatus && this.selectedStatus != "Any") {
        if (this.selectedStatus != "Any") {
          list = list.filter((i) => {
            if (i.status == this.selectedStatus) return true;
            else if (this.selectedStatus == "Inactive" && i.status.indexOf("Inactive") >= 0) return true;
            else if (this.selectedStatus == "Scheduled" && i.status.indexOf("Scheduled") >= 0) return true;
            else if (this.selectedStatus == "Pending" && pendingStates.indexOf(i.status) >= 0) return true;
            else if (this.selectedStatus == "Approved" && i.status.indexOf("Approved") >= 0) return true;

            return false;
          });
        }
      }

      this.filteredList = list;
    },
    openItem(item) {
      console.log("OPEN", item._id);
      window.open(`/form-b/${item._id}`);
    },
  },
};
</script>
