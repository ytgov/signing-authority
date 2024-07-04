<template>
  <v-container fluid class="down-top-padding">
    <BaseBreadcrumb title="Vroozi Integration" :breadcrumbs="breadcrumbs"> </BaseBreadcrumb>

    <v-row>
      <v-col>
        <v-card color="#fff2d5" class="mb-6" :disabled="isLoading">
          <v-progress-linear v-if="isLoading" color="warning" height="4" indeterminate></v-progress-linear>
          <div v-else style="height: 4px"></div>

          <v-card-title class="d-flex pt-1">
            Vroozi Users
            <v-spacer></v-spacer>
            <v-btn icon color="primary" class="my-0" title="Reload" @click="loadAuditData">
              <v-icon>mdi-refresh</v-icon>
            </v-btn>
          </v-card-title>
          <v-divider />

          <v-list>
            <div v-for="(user, idx) of userStats" :key="user.email">
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title> {{ user.email }}</v-list-item-title>
                  <v-list-item-subtitle>{{ user.activeCount }} Active Accounts in {{user.departmentCount}} Departments </v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-action>
                  <div class="d-flex">
                    <v-btn
                      color="primary"
                      x-small
                      class="my-0 float-right"
                      @click="downloadClick(user.email)"
                      fab
                      title="Download CSV"
                      ><v-icon>mdi-download</v-icon>
                    </v-btn>
                    <v-btn
                      color="primary"
                      x-small
                      class="my-0 ml-2"
                      @click="resendClick(user.email)"
                      fab
                      title="Resend Authorities to Vroozi"
                      ><v-icon>mdi-sync</v-icon>
                    </v-btn>
                  </div>
                </v-list-item-action>
              </v-list-item>
              <v-divider v-if="idx < userStats.length - 1"></v-divider>
            </div>
          </v-list>

          <!-- <div v-for="(user, idx) of userStats" :key="user.email">
            <v-card-text>
              <v-row>
                <v-col cols="12" md="8">
                  <span style="font-size: 1.25rem"> {{ user.email }}</span>

                  <v-row class="mt-5">
                    <v-col>
                      <div style="font-size: 40px" class="mb-1">{{ user.activeCount }}</div>
                      Active Accounts
                    </v-col>
                    <v-col>
                      <div style="font-size: 40px" class="mb-1">{{ user.departmentCount }}</div>
                      Departments
                    </v-col>
                  </v-row>
                </v-col>
                <v-col cols="12" md="4" class="text-right pt-9 mt-1">
                  <v-btn color="primary" small class="my-1" @click="downloadClick(user.email)">Download CSV </v-btn>
                  <br />
                  <v-btn color="primary" small class="my-1" @click="resendClick(user.email)">Resend Authorities</v-btn>
                </v-col>
              </v-row>
            </v-card-text>
            <v-divider v-if="idx < userStats.length - 1" />
          </div> -->
        </v-card>
      </v-col>
      <v-col>
        <v-card color="#fff2d5" class="mb-6" :disabled="isLoading">
          <v-progress-linear v-if="isLoading" color="warning" height="4" indeterminate></v-progress-linear>
          <div v-else style="height: 4px"></div>
          <v-card-title class="d-flex pt-1">
            Integration Logs
            <v-spacer></v-spacer>
            <v-btn icon color="primary" class="my-0" title="Reload" @click="loadLogs">
              <v-icon>mdi-refresh</v-icon>
            </v-btn>
          </v-card-title>

          <v-card-text>
            <div style="max-height: 400px; overflow-y: auto;">
              <table
                class="table"
                cellspacing="0"
                cellpadding="0"
                style="background-color: white; width: 100%; text-align: left"
              >
                <tr>
                  <th style="width: 140px">Date</th>
                  <th>Action</th>
                  <th>Result</th>
                </tr>

                <tbody v-for="log of logs" :key="log.id">
                  <tr>
                    <td style="border-left: 1px #ddd solid !important;">{{ formatDate(log.date) }}</td>
                    <td>{{ log.action }}</td>
                    <td
                      style="border-right: 1px #ddd solid !important;"
                      :class="log.message == 'Failed' ? 'text-error' : ''"
                    >
                      {{ log.message }}
                    </td>
                  </tr>
                  <tr>
                    <td style="border-left: 1px #ddd solid !important;border-bottom:1px #999 solid !important;">
                      &nbsp;
                    </td>
                    <td
                      colspan="2"
                      style="border-bottom:1px #999 solid !important;border-right: 1px #ddd solid !important;"
                    >
                      {{ log.result }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import moment from "moment";
import { mapActions, mapState } from "vuex";
import { makeCSV, saveCSVFile } from "@/utils/outputs";

export default {
  data: () => ({
    breadcrumbs: [{ text: "Reports Home", to: "/reports", exact: true }, { text: "Vroozi Integration" }],
    logSince: "today",
  }),
  computed: {
    ...mapState("vrooziReports", ["userStats", "logs", "isLoading"]),
    sinceOptions() {
      return ["today", "yesterdsay"];
    },
  },
  async mounted() {
    await this.loadAuditData();
    await this.loadLogs();
  },

  methods: {
    ...mapActions("vrooziReports", ["loadAuditData", "sendAuthorities", "downloadCSV", "loadLogs"]),
    async loadAuditClick() {
      await this.loadAuditData();
    },
    async downloadClick(email) {
      let listing = await this.downloadCSV(email);
      let csvData = listing.map((i) => {
        return {
          account: i.account,
          limit: i.limit,
          start_date: i.start_date,
          end_date: i.end_date,
        };
      });

      let csv = makeCSV(csvData);
      saveCSVFile(csv, `vroozi-report-${email}.csv`);
    },
    async resendClick(email) {
      this.sendAuthorities(email).then(() => {
        Notification;
        this.loadLogs();
      });
    },
    formatDate(input) {
      return moment(input).format("yyyy-MM-DD h:mm a");
    },
  },
};
</script>
<style scoped>
.table {
  border-collapse: collapse;
}
.table thead {
  text-transform: uppercase;
}
.table th {
  text-align: left;
  border: 1px #ddd solid;
  border-bottom: 1px #999 solid !important;
  padding: 2px 7px;
  font-size: 12px;
}

.table td {
  /* border: 1px #ddd solid; */
  padding: 2px 7px;
  font-size: 12px;
  /*border: 1px #ddd solid; */
  border-bottom: none !important;
  padding: 2px 7px;
  font-size: 12px;
}
</style>
