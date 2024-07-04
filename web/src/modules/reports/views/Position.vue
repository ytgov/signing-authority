<template>
  <v-container fluid class="down-top-padding">
    <BaseBreadcrumb title="Position Reporting" :breadcrumbs="breadcrumbs"> </BaseBreadcrumb>

    <v-card class="mb-6 default" :disabled="isLoading">
      <v-progress-linear v-if="isLoading" color="warning" height="4" indeterminate></v-progress-linear>
      <div v-else style="height: 4px"></div>


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
              :items="['Any', 'Active', 'Locked', 'Inactive', 'Archived']"
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
    breadcrumbs: [{ text: "Reports Home", to: "/reports", exact: true }, { text: "Position Reporting" }],
    headers: [
      { text: "Department", value: "department_descr" },
      { text: "Program", value: "program_branch" },
      { text: "Activity", value: "activity" },

      { text: "Position", value: "position" },

      { text: "Status", value: "status" },
      { text: "", value: "actions", width: "80" },
    ],

    filteredList: [],
    selectedDepartments: [],
    selectedStatus: "Any",
    selectedTypes: [],
    search: "",
  }),
  computed: {
    ...mapState("reports", ["isLoading", "positionList"]),
    ...mapState("department", ["departments"]),
  },
  async mounted() {
    await this.loadPositionList();
    this.filterChanged();
  },

  methods: {
    ...mapActions("reports", ["loadPositionList"]),
    async downloadClick() {
      let csvData = this.filteredList.map((i) => {
        return {
          department: i.department_code,
          program: i.program_branch,
          activity: i.activity,
          position: i.position,
          status: i.status,
        };
      });

      let csv = makeCSV(csvData);
      saveCSVFile(csv, "position-report.csv");
    },
    shortCutSelectDepartment(searchInput) {
      if (this.departments.filter((department) => department.dept === searchInput).length === 1) {
        this.selectDepartment(searchInput);
      }
    },
    filterChanged() {
      let list = clone(this.positionList);

      if (this.selectedDepartments && this.selectedDepartments.length > 0) {
        list = list.filter((i) => this.selectedDepartments.includes(i.department_code));
      }

      if (this.selectedTypes && this.selectedTypes.length > 0) {
        list = list.filter((i) => this.selectedTypes.includes(i.authority_type));
      }

      if (this.selectedStatus && this.selectedStatus != "Any") {
        list = list.filter((i) => {
          if (this.selectedStatus == "Active" && i.status == "Active") return true;
          else if (this.selectedStatus == "Inactive" && i.status.indexOf("Inactive") == 0) return true;
          else if (this.selectedStatus == "Locked" && i.status.indexOf("Locked") == 0) return true;
          else if (this.selectedStatus == "Archived" && i.status == "Archived") return true;

          return false;
        });
      }

      this.filteredList = list;
    },
    openItem(item) {
      window.open(`/departments/${item.department_code}/positions/${item._id}`);
    },
  },
};
</script>
