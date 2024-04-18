<template>
  <v-container fluid class="down-top-padding">
    <BaseBreadcrumb title="Audit Reporting" :breadcrumbs="breadcrumbs"> </BaseBreadcrumb>

    <!-- <h2>Form B List</h2> -->
    <v-card class="mb-6 default" :disabled="isLoading">
      <v-progress-linear v-if="isLoading" color="warning" height="4" indeterminate></v-progress-linear>
      <div v-else style="height: 4px"></div>

      <div></div>

      <v-card-text>
        <v-row class="mb-3">
          <v-col cols="12" md="8">
            <v-autocomplete
              dense
              outlined
              background-color="white"
              :items="departments"
              item-text="display_name"
              item-value="dept"
              hide-details
              label="Department"
              v-model="selectedDepartment"
            >
            </v-autocomplete>
          </v-col>
          <v-col cols="12" md="4">
            <v-menu
              v-model="dateMenu"
              :close-on-content-click="false"
              transition="scale-transition"
              left
              nudge-top="26"
              offset-y
              min-width="auto"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  v-model="date"
                  label="Effective date"
                  append-icon="mdi-calendar"
                  readonly
                  outlined
                  hide-details
                  dense
                  background-color="white"
                  v-bind="attrs"
                  v-on="on"
                ></v-text-field>
              </template>
              <v-date-picker v-model="date" @input="dateMenu = false" :max="today"></v-date-picker>
            </v-menu>
          </v-col>

          <v-col cols="12" md="8">
            <v-text-field
              v-model="search"
              label="Employee filter"
              dense
              outlined
              background-color="white"
              hide-details
            ></v-text-field>
          </v-col>
          <v-col>
            <div class="text-right">
              <v-btn color="primary" class="my-0 mr-3" @click="runReportClick" :disabled="!canRunReport">Preview</v-btn>
              <v-btn color="primary" class="my-0" @click="downloadClick" :disabled="!canRunReport || auditList.length == 0"
                >Download</v-btn
              >
            </div>
          </v-col>
        </v-row>

        <v-data-table :items="auditList" :headers="headers" dense>
          <template v-slot:item.actions="{ item }">
            <v-icon color="success" @click="openItem(item)">mdi-link-variant</v-icon>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import { mapActions, mapState } from "vuex";
import moment from "moment";

export default {
  data: () => ({
    breadcrumbs: [{ text: "Reports Home", to: "/reports", exact: true }, { text: "Audit Reporting" }],
    headers: [
      { text: "Employee", value: "employee.name" },
      { text: "Position", value: "employee.title" },
      { text: "Coding", value: "coding" },
      { text: "", value: "actions", width: "60" },
    ],

    selectedDepartment: null,
    search: "",
    dateMenu: null,
    date: null,
    today: moment().format("YYYY-MM-DD"),
  }),
  computed: {
    ...mapState("reports", ["isLoading", "auditList"]),
    ...mapState("department", ["departments"]),

    canRunReport() {
      return this.date && this.selectedDepartment;
    },
  },
  methods: {
    ...mapActions("reports", ["loadAuditList", "auditDownloadUrl"]),
    async downloadClick() {
      const downloadUrl = await this.auditDownloadUrl({
        email: this.search,
        date: this.date,
        department: this.selectedDepartment,
      });
      console.log("DOWNLOAD CLICKED", downloadUrl);
      window.open(downloadUrl);
    },
    async runReportClick() {
      await this.loadAuditList({ email: this.search, date: this.date, department: this.selectedDepartment });
    },
    shortCutSelectDepartment(searchInput) {
      if (this.departments.filter((department) => department.dept === searchInput).length === 1) {
        this.selectDepartment(searchInput);
      }
    },
    openItem(item) {
      console.log("OPEN", item._id);
      window.open(`/form-b/${item._id}`);
    },
  },
};
</script>
