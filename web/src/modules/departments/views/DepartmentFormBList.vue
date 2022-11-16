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
          label="Status"
          v-model="statusFilter"
          :items="['Any', 'Active', 'Approved', 'Pending', 'Scheduled', 'Inactive', 'Archived']"
          @change="filterList"
          single-line
          hide-details
          background-color="white"
          class="ml-5"
        />
      </template>
      <template v-slot:right>
        <create-form-b :department="item" v-if="canAdminister"></create-form-b>
      </template>

      <v-card class="default">
        <v-card-title>Form B Authorizations</v-card-title>
        <v-card-text>
          <department-form-b-list :search="search" :status="statusFilter"> </department-form-b-list>
        </v-card-text>
      </v-card>
    </BaseCard>
  </v-container>
</template>

<script>
import { mapActions, mapState } from "vuex";
import departmentFormBList from "../components/departmentFormBList.vue";
import createFormB from "@/modules/forms/formB/components/createFormB.vue";

export default {
  components: { departmentFormBList, createFormB },
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
    item: {},
    departmentId: "",
    statusFilter: "",
  }),
  mounted: async function() {
    this.departmentId = this.$route.params.departmentId;
    this.item = await this.getDepartment({ id: this.departmentId });

    this.breadcrumbs[1].to = `/departments/${this.departmentId}`;
    this.breadcrumbs[1].text = this.item.descr;

    let status = this.$route.query.status || "";

    if (status) {
      this.statusFilter = status;
    }
  },
  computed: {
    ...mapState("home", ["profile"]),

    canAdminister() {
      if (this.profile && this.profile.roles.length > 0) {
        if (this.profile.roles.includes("System Admin")) return true;

        if (
          this.profile.roles.includes("Form B Administrator") &&
          this.profile.department_admin_for.includes(this.departmentId)
        )
          return true;
      }

      return false;
    },
  },
  methods: {
    ...mapActions("department", ["getDepartment"]),
    filterList() {},
  },
};
</script>
