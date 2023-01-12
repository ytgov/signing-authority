<template>
  <v-row>
    <v-col>
      <v-card :to="activeFormBLink">
        <v-card-text class="text-h4 mb-0 pb-0">
          {{ activeFormBCount }}
        </v-card-text>
        <v-card-text class="mt-0 pt-0">Active Form B's</v-card-text>
      </v-card>
    </v-col>
    <v-col>
      <v-card :to="pendingFormBLink">
        <v-card-text class="text-h4 mb-0 pb-0">
          {{ pendingCount }}
        </v-card-text>
        <v-card-text class="mt-0 pt-0">Pending Form B's</v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
export default {
  name: "departmentFormBSummary",
  props: {
    activeFormBCount: {
      type: Number,
      default: 0,
    },
    pendingCount: {
      type: Number,
      default: 0,
    },
  },
  computed: {
    activeFormBLink() {
      return {
        name: "DepartmentFormBList",
        params: { departmentId: this.$route.params.departmentId },
        query: { status: "Active" },
      };
    },
    pendingFormBLink() {
      return {
        name: "DepartmentFormBList",
        params: { departmentId: this.$route.params.departmentId },
        query: { status: "Pending" },
      };
    },
  },
};
</script>
