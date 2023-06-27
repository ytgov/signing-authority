<template>
  <v-container fluid class="down-top-padding">
    <BaseBreadcrumb :title="page.title" :icon="page.icon" :breadcrumbs="breadcrumbs"> </BaseBreadcrumb>

    <BaseCard>
      <v-row>
        <v-col cols="6">
          <v-card class="default mb-5">
            <v-card-text>
              <router-link to="/administration/users">Manage Users</router-link>
            </v-card-text>
          </v-card>
          <v-card class="default mb-5">
            <v-card-text>
              <router-link to="/administration/form-a">All Form A's</router-link>
            </v-card-text>
          </v-card>
          <v-card class="default mb-5">
            <v-card-text>
              <router-link to="/administration/positions">All Positions</router-link>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col>
          <v-card class="my-0 default">
            <healthCheck></healthCheck>
          </v-card>
        </v-col>
        <!--  <v-col>
                    <v-card class="my-0 default">
                        <seed-data></seed-data>
                    </v-card>
                </v-col> -->
      </v-row>
    </BaseCard>
    <notifications ref="notifier"></notifications>
  </v-container>
</template>

<script>
import healthCheck from "../components/health/healthCheck.vue";
//import SeedData from "../components/seed/seedData.vue";

export default {
  name: "Home",
  components: {
    healthCheck,
    //SeedData,
  },
  data: () => ({
    page: { title: "Administration Home" },
    breadcrumbs: [{ text: "Administration" }],
  }),
  mounted() {},
  computed: {},
  methods: {},
};
</script>
