<template>
  <div class="home">
    <h1>Administration: <small>Home</small></h1>

    <div class="row">
      <div class="col-md-4">
        <v-card class="mt-5 default">
          <v-card-title></v-card-title>
          <v-card-text>
            <healthCheck></healthCheck>
          </v-card-text>
        </v-card>
      </div>
    </div>

    <notifications ref="notifier"></notifications>
  </div>
</template>

<script>

import healthCheck from "../components/healthCheck.vue";
export default {
  name: "Home",
  components: {
    healthCheck
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
