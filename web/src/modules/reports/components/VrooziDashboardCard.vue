<template>
  <v-card color="#fff2d5" class="mb-2" style="height: 130px" to="/reports/vroozi" :disabled="isLoading">
    <v-progress-linear v-if="isLoading" color="warning" height="4" indeterminate></v-progress-linear>
    <div v-else style="height: 4px"></div>

    <v-card-title class="d-flex pt-1">
      Vroozi Integration
      <v-spacer></v-spacer>
      <v-btn icon color="primary" class="my-0" title="Reload" @click.prevent="loadAuditData">
        <v-icon>mdi-refresh</v-icon>
      </v-btn>
    </v-card-title>

    <v-card-text>
      <div style="font-size: 40px" class="mb-1">{{ activeCount }}</div>
      Active Users
    </v-card-text>
  </v-card>
</template>

<script>
import { mapActions, mapState } from "vuex";

export default {
  data: () => ({}),
  computed: {
    ...mapState("vrooziReports", ["userStats", "isLoading"]),
    activeCount() {
      if (this.userStats) {
        let activeEmails = this.userStats.filter((e) => e.activeCount > 0);
        return activeEmails.length;
      }

      return "";
    },
  },
  methods: {
    ...mapActions("vrooziReports", ["loadAuditData"]),
  },
  async mounted() {
    await this.loadAuditData();
  },
};
</script>
