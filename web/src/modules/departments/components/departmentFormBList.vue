<template>
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
</template>
<script>
import { mapActions } from "vuex";
import _ from "lodash";

export default {
  name: "FormBList",
  props: {
    search: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      default: "",
    },
  },
  data: () => ({
    departmentId: "",
    formBLink: "",
    allItems: [],
    formBItems: [],
    loadingFormB: false,
    headers: [
      { text: "Position", value: "employee.title" },
      { text: "Employee", value: "employee.name" },
      { text: "Status", value: "status" },
      { text: "Type", value: "authority_type" },
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
  watch: {
    status: function() {
      this.filterList();
    },
  },
  mounted: async function() {
    this.loadingFormB = true;
    this.departmentId = this.$route.params.departmentId;
    this.formBLink = `/departments/${this.departmentId}/form-b`;
    this.allItems = await this.getFormBList({ id: this.departmentId });

    this.filterList();
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
    filterList() {
      let list = _.clone(this.allItems);

      let pendingStates = ["Inactive (Locked for Signatures)", "Inactive (Finance Approve)"];

      if (this.status && this.status != "Any") {
        list = list.filter((i) => {
          if (i.status == this.status) return true;
          else if (this.status == "Inactive" && i.status.indexOf("Inactive") >= 0) return true;
          else if (this.status == "Scheduled" && i.status.indexOf("Scheduled") >= 0) return true;
          else if (this.status == "Pending" && pendingStates.indexOf(i.status) >= 0) return true;
          else if (this.status == "Approved" && i.status.indexOf("Approved") >= 0) return true;

          return false;
        });
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
