<template>
  <v-card class="default">
    <v-card-title>Active Form B Authorizations</v-card-title>
    <v-card-text>
      <department-form-b-summary :actingCount="actingFormB" :activeFormBCount="activeFormB" />
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
      { text: "Position", value: "employee.title" },
      { text: "Employee", value: "employee.name" },
    ],
  }),
  computed: {
    activeFormB() {
      return this.formBItems.length;
    },
    actingFormB() {
      return 0;
    },
  },
  mounted: async function() {
    this.loadingFormB = true;
    this.departmentId = this.$route.params.departmentId;
    this.formBLink = `/departments/${this.departmentId}/form-b`;
    this.formBItems = await this.getFormBList({ id: this.departmentId });
    this.loadingFormB = false;
  },
  methods: {
    ...mapActions("department", ["getFormBList"]),
    openFormB(item) {
      this.$router.push({
        name: "FormBDetails",
        params: { formBId: item._id },
      });
    },
  },
};
</script>
