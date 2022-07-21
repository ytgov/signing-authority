<template>
  <v-card class="default">
    <v-card-title>Active Form B Authorizations</v-card-title>
    <v-card-text>
      <department-form-b-summary
        :actingCount="actingFormB"
        :activeFormBCount="activeFormB"
      />
      <v-data-table
        class="mt-5"
        :headers="headers"
        :search="search"
        :items="formBItems"
        :loading="loadingFormB"
        @click:row="openFormB"
      >
      </v-data-table>
      <div class="mt-4 ml-2">
        <router-link :to="formBLink">View all</router-link>
      </div>
    </v-card-text>
  </v-card>
</template>
<script>
import { mapActions } from "vuex";
import departmentFormBSummary from "./departmentFormBSummary.vue";
export default {
  components: { departmentFormBSummary },
  name: "FormBList",
  props: {
    search: {
      type: String,
      default: "",
    },
  },
  data: () => ({
    departmentId: "",
    formBLink: "",
    formBItems: [],
    loadingFormB: false,
    headers: [
      { text: "Employee", value: "employee_name" },
      { text: "Position", value: "title" },
    ],
  }),
  computed: {
    activeFormB() {
      console.log("FORMBITEmS", this.formBItems)

      return this.formBItems.length;
    },
    actingFormB() {
      return 0;
    },
  },
  mounted: async function () {
    this.departmentId = this.$route.params.departmentId;
    this.formBLink = `/departments/${this.departmentId}/form-b`;
    this.formBItems = await this.getFormBList({id: this.departmentId});
  },
  methods: {
    ...mapActions("department", ["getFormBList"]),
    openFormB() {
      this.$router.push({
        name: "DepartmentFormBList",
        params: { id: this.departmentId },
      });
    },
  },
};
</script>

