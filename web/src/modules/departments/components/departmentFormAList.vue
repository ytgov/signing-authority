<template>
  <v-card class="default">
    <v-card-title>Delegations by Position</v-card-title>
    <v-card-text>
      <department-form-a-summary
        :positionCount="positions.length"
        :awaitingFormACount="pendingGroups.length"
        :awaitingPositionCount="lockedPositions.length"
      />

      <v-data-table
        :headers="[
          { text: 'Program : Activity', value: 'program_activity' },
          { text: 'Position', value: 'position' },
        ]"
        dense
        :search="search"
        :items="positions"
        :loading="loadingFormA"
        @click:row="openFormA"
        class="row-clickable"
      >
      </v-data-table>
      <div class="mt-4 ml-2">
        <router-link :to="formALink">View all</router-link>
      </div>
    </v-card-text>
  </v-card>
</template>
<script>
import { mapActions, mapGetters } from "vuex";
import departmentFormASummary from "../components/departmentFormASummary.vue";

export default {
  name: "FormAList",
  components: {
    departmentFormASummary,
  },
  props: {
    search: { type: String, default: "" },
    pendingGroups: { type: Array, default: new Array() },
  },

  data: () => ({
    formAItems: [],
    loadingFormA: false,
  }),
  computed: {
    ...mapGetters("department", ["getDepartmentDetails"]),
    activeFormA() {
      return this.formAItems;
    },
    formALink() {
      return {
        name: "DepartmentPositionList",
        params: { id: this.$route.params.id },
      };
    },
    positions() {
      return this.formAItems;
    },
    lockedPositions() {
      return this.formAItems.filter((p) => p.status == "Locked");
    },
  },
  mounted: async function() {
    this.loadingFormA = true;
    this.formAItems = (await this.getDepartmentFormAList(this.$route.params.departmentId)).filter(
      (i) => i.status != "Archived"
    );
    this.loadingFormA = false;
  },
  methods: {
    ...mapActions("forms/formA", ["getDepartmentFormAList"]),

    openFormA(item) {
      this.$router.push(`/departments/${this.$route.params.departmentId}/positions/${item._id}`);
    },
  },
};
</script>
