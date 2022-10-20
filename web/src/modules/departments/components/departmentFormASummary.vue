<template>
  <v-row class="pb-5">
    <v-col>
      <v-card :to="formALink">
        <v-card-text class="text-h4 mb-0 pb-0">
          {{ awaitingFormACount }}
        </v-card-text>
        <v-card-text class="mt-0 pt-0">Pending Form As</v-card-text>
      </v-card>
    </v-col>
    <v-col>
      <v-card :to="positionsLink">
        <v-card-text class="text-h4 mb-0 pb-0">
          {{ positionCount }}
        </v-card-text>
        <v-card-text class="mt-0 pt-0">Positions</v-card-text>
      </v-card>
    </v-col>
    <v-col>
      <v-card :to="awaitingPositionsLink">
        <v-card-text class="text-h4 mb-0 pb-0">
          {{ awaitingPositionCount }}
        </v-card-text>
        <v-card-text class="mt-0 pt-0">Positions awaiting Authorization</v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
export default {
  name: "departmentFormASummary",
  props: {
    awaitingFormACount: {
      type: Number,
      default: 0,
    },
    positionCount: {
      type: Number,
      default: 0,
    },
    awaitingPositionCount: {
      type: Number,
      default: 0,
    },
  },
  computed: {
    formALink() {
      return {
        name: "DepartmentPendingGroups",
        params: { departmentId: this.$route.params.departmentId },
      };
    },
    positionsLink() {
      return {
        name: "DepartmentPositionList",
        params: { departmentId: this.$route.params.departmentId },
      };
    },
    awaitingPositionsLink() {
      return {
        name: "DepartmentPositionList",
        params: { departmentId: this.$route.params.departmentId },
        query: { status: "Locked" },
      };
    },
  },
};
</script>
