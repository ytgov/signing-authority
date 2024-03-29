<template>
  <v-container fluid class="down-top-padding">
    <BaseBreadcrumb :title="page.title" :icon="page.icon" :breadcrumbs="breadcrumbs"> </BaseBreadcrumb>

    <v-row>
      <v-col cols="12" md="6">
        <VrooziDashboardCard></VrooziDashboardCard>
      </v-col>
      <v-col cols="12" md="6">
        <v-card color="#fff2d5" class="mb-2" style="height: 130px" to="/reports/form-b">
          <v-card-title class="pt-2">Form B Reporting</v-card-title>
          <v-card-text> View Form B records from across the government filtered by type, status and department.</v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card color="#fff2d5" class="mb-2" style="height: 130px" to="/reports/position">
          <v-card-title class="pt-2">Position Reporting</v-card-title>
          <v-card-text> View Position records from across the government filtered by type, status and department.</v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import VrooziDashboardCard from "../components/VrooziDashboardCard.vue";

export default {
  name: "ReportDashboard",
  components: { VrooziDashboardCard },
  data: () => ({
    page: { title: "Reports", icon: "mdi-chart-bar" },
    breadcrumbs: [{ text: "Reports Home" }],
  }),
  computed: {},
  methods: {},
  async mounted() {},
};
</script>
