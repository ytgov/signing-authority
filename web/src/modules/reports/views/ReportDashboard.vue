<template>
  <v-container fluid class="down-top-padding">
    <BaseBreadcrumb :title="page.title" :icon="page.icon" :breadcrumbs="breadcrumbs"> </BaseBreadcrumb>

    <div>
      Report Dashboard
    </div>
  </v-container>
</template>

<script>
export default {
  name: "ReportDashboard",
  data: () => ({
    page: { title: "Reports", icon: "mdi-chart-bar" },
    breadcrumbs: [{ text: "Reports Home" }],
  }),
  computed: {},
  methods: {},
  async mounted() {},
};
</script>
