<template>
  <v-container fluid class="down-top-padding">
    <BaseBreadcrumb :title="page.title" :icon="page.icon" :breadcrumbs="breadcrumbs"></BaseBreadcrumb>

    <BaseCard :showHeader="true">
      <template slot="left">
        <v-text-field
          label="Account Code Search"
          single-line
          hide-details
          v-model="search"
          @click:append="doSearch"
          @keydown="searchKeyUp"
          class="mr-5"
        ></v-text-field>

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
              label="As at date"
              append-icon="mdi-calendar"
              readonly
              hide-details
              background-color="white"
              v-bind="attrs"
              v-on="on"
            ></v-text-field>
          </template>
          <v-date-picker v-model="date" @input="dateMenu = false" ></v-date-picker>
        </v-menu>

        <v-btn small @click="doSearch" color="primary" class="my-0 ml-5">Search</v-btn>
      </template>

      <v-alert v-if="responseErrors" dense type="error">
        {{ responseErrors }}
      </v-alert>

      <v-card class="default">
        <v-card-title
          >Form B Authorizations that encompass '<strong>{{ searchValue }}</strong
          >'</v-card-title
        >
        <v-card-text>
          <div class="mb-1">Further refine your results:</div>
          <v-row class="mb-4">
            <v-col cols="12" md="6">
              <v-text-field
                v-model="search2"
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
                :items="['Active', 'Inactive']"
                @change="filterList"
                outlined
                dense
                hide-details
                background-color="white"
              />
            </v-col>
          </v-row>

          <v-data-table
            :items="filteredResults"
            :search="search2"
            :loading="loading"
            :headers="[
              { text: 'Name', value: 'employee.name' },
              { text: 'Title', value: 'employee.title' },
              { text: 'Program', value: 'program_branch' },
              { text: 'Activity', value: 'activity' },
              { text: 'Status', value: 'status' },
            ]"
            @click:row="selectAuthority"
            class="row-clickable"
            show-expand
            :single-expand="true"
            item-key="_id"
            expanded.sync
          >
            <template v-slot:item.status="{ item }">
              {{ item.status }} (<span style="text-transform:capitalize;">{{ item.authority_type }}</span
              >)
            </template>

            <template v-slot:expanded-item="{ headers, item }">
              <td :colspan="headers.length">
                <table class="subtable" cellpadding="0" cellspacing="0">
                  <tr>
                    <th style="text-align: left;">Area of Authority</th>
                    <th style="text-align: left;">Operational Restriction</th>
                    <th>S.24 Goods</th>
                    <th>S.24 Services</th>
                    <th>S.24 Request</th>
                    <th>S.24 Assignment</th>
                    <th>S.23 Goods</th>
                    <th>S.23 Services</th>
                    <th>S.24 Commitment</th>
                    <th>S.23 Transfer</th>
                    <th>S.24 Travel</th>
                    <th>Other Exp</th>
                    <th>Loans</th>
                    <th>S.29</th>
                    <th>S.30</th>
                  </tr>

                  <tr v-for="(line, index) of item.authority_lines" :key="index">
                    <td style="text-align: left;">{{ line.coding }}</td>
                    <td style="text-align: left;">{{ line.operational_restriction }}</td>
                    <td>{{ line.s24_procure_goods_limit }}</td>
                    <td>{{ line.s24_procure_services_limit }}</td>
                    <td>{{ line.s24_procure_request_limit }}</td>
                    <td>{{ line.s24_procure_assignment_limit }}</td>
                    <td>{{ line.s23_procure_goods_limit }}</td>
                    <td>{{ line.s23_procure_services_limit }}</td>
                    <td>{{ line.s24_transfer_limit }}</td>
                    <td>{{ line.s23_transfer_limit }}</td>
                    <td>{{ line.s24_travel_limit }}</td>
                    <td>{{ line.other_limit }}</td>
                    <td class="cell">{{ line.loans_limit }}</td>
                    <td class="cell">{{ line.s29_performance_limit }}</td>
                    <td class="cell">{{ line.s30_payment_limit }}</td>
                  </tr>
                </table>
              </td>
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>
    </BaseCard>
  </v-container>
</template>

<style scoped>
.subtable {
  width: 100%;
  border-left: 1px #999 solid;
  border-top: 1px #999 solid;
  margin: 10px 0 10px 0;
}
.subtable th {
  font-size: 12px;
  border-right: 1px #999 solid;
  border-bottom: 1px #999 solid;
  padding: 1px;
}
.subtable td {
  font-size: 12px;
  text-align: center;
  border-right: 1px #999 solid;
  border-bottom: 1px #999 solid;
  padding: 1px;
}
</style>

<script>
import { clone } from "lodash";
import moment from "moment";
import { mapActions } from "vuex";
import { cleanCoding } from "@/modules/forms/formB/store";

export default {
  data: () => ({
    page: { title: "Code Search" },
    breadcrumbs: [{ text: "Dashboard", to: "/dashboard" }, { text: "Code Search" }],
    search: "",
    searched: "",
    searchResults: [],
    filteredResults: [],
    responseErrors: undefined,
    loading: false,
    expanded: [],

    search2: "",
    statusFilter: "Active",

    dateMenu: null,
    date: null,
    today: moment().format("YYYY-MM-DD"),
  }),
  async mounted() {
    if (this.$route.query && this.$route.query.query) {
      this.search = this.$route.query.query;
      await this.doSearch();
    }

    this.date = moment().format("YYYY-MM-DD");
  },
  computed: {
    searchValue() {
      if (this.searched && this.searched.length > 0) {
        return cleanCoding(this.searched);
      }

      return "";
    },
  },
  methods: {
    ...mapActions("authority/formB", ["accountSearch"]),
    searchKeyUp(event) {
      if (event.key == "Enter") this.doSearch();
    },
    async doSearch() {
      this.searchResults = [];

      let cleanSearch = (this.search = cleanCoding(this.search));
      if (cleanSearch.length == 0) return;

      this.loading = true;
      this.responseErrors = undefined;
      this.searched = cleanSearch;

      this.searchResults = await this.accountSearch({ term: cleanSearch.replace(/-/g, ""), date: this.date })
        .catch((e) => {
          this.responseErrors = e.response.data.errors[0].msg;
        })
        .finally(() => {
          this.loading = false;
        });
      this.filterList();
    },
    filterList() {
      let list = clone(this.searchResults);

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

      this.filteredResults = list;
    },
    selectAuthority(item) {
      this.$router.push(`/form-b/${item._id}`);
    },
    createAuthorityClick() {
      this.$refs.createAuthorityDialog.show();
    },
  },
};
</script>
