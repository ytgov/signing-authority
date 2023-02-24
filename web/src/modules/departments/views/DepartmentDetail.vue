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
      <template v-slot:right> </template>

      <v-row>
        <v-col>
          <department-form-a-list :search="search" :pendingGroups="pendingGroups" />
        </v-col>
        <v-col>
          <v-card class="default">
            <v-card-title>Form B Authorizations</v-card-title>
            <v-card-text>
              <department-form-b-summary :activeFormBCount="activeFormB" :pendingCount="pendingFormB" />

              <department-form-b-list :search="search" />
              <div class="mt-4 ml-2">
                <router-link :to="`/departments/${this.departmentId}/form-b`">View all</router-link>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </BaseCard>
  </v-container>
</template>

<script>
import { mapActions, mapState } from "vuex";
import departmentFormAList from "../components/departmentFormAList";
import departmentFormBList from "../components/departmentFormBList";
import departmentFormBSummary from "../components/departmentFormBSummary";

export default {
  components: {
    departmentFormAList,
    departmentFormBList,
    departmentFormBSummary,
  },
  name: "DepartmentDetail",
  data: () => ({
    search: "",
    drawer: null,
    searchResults: [],
    loading: false,
    page: {
      title: "Departments",
    },
    breadcrumbs: [
      {
        text: "Signing Authorities Home",
        to: "/dashboard",
      },
      {
        text: "",
        disabled: true,
      },
    ],
    departmentId: "",
    item: {},
    loadingFormB: true,
    pendingGroups: [],
    formBList: [],
  }),
  mounted: async function() {
    this.departmentId = this.$route.params.departmentId;
    this.loadList();
  },
  computed: {
    ...mapState("department", ["departments"]),

    pendingFormB() {
      let pendingStates = ["Inactive (Locked for Signatures)", "Inactive (Upload Signatures)"];
      return this.formBList.filter((f) => pendingStates.indexOf(f.status) >= 0).length;
    },
    activeFormB() {
      return this.formBList.filter((f) => f.status == "Active").length;
    },
  },
  methods: {
    ...mapActions("department", ["getDepartment", "getPendingGroups", "getFormBList"]),

    async loadList() {
      this.item = await this.getDepartment({ id: this.departmentId });
      if (this.item && this.item.dept) {
        this.breadcrumbs[1].text = this.item.descr;
        this.page.title = this.item.descr;
      }

      let groups = await this.getPendingGroups({
        id: this.departmentId,
      });

      this.pendingGroups = groups.filter((g) => g.status != "Active" && g.status != "Archived");
      this.formBList = await this.getFormBList({ id: this.departmentId });
    },
  },
};
</script>
