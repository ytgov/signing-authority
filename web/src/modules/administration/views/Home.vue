<template>
  <div class="home">
    <h1>Administration: <small>Home</small></h1>

    <div class="row">
      <div class="col-md-4">
        <v-card class="mt-5 default">

            <healthCheck></healthCheck>

        </v-card>
      </div>
      <div class="col-md-4">
        <v-card class="mt-5 default">
          <seed-data></seed-data>
            <!-- Seed Data -->

        </v-card>
      </div>
    </div>

    <notifications ref="notifier"></notifications>
  </div>
</template>

<script>

import healthCheck from "../components/health/healthCheck.vue";
import SeedData from '../components/seed/seedData.vue';

export default {
  name: "Home",
  components: {
    healthCheck,
    SeedData
    },
  data: () => ({

  }),
  created() {
  },
  computed: {
  },
  methods: {
  },
};
</script>
