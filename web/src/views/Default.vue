<template>
  <v-overlay>
    <div class="text-center">
      <v-progress-circular
        indeterminate
        size="64"
        class="mb-5"
      ></v-progress-circular>
      <h1 class="title">{{title}}</h1>
    </div>
  </v-overlay>
</template>

<script>
import { applicationName } from "../config";

export default {
  name: "Default",
  data: () => ({
    title: `Loading ${applicationName}`,
  }),
  methods: {

  },
  computed: {
  },
  watch: {
  },
  async mounted() {
    if (this.$auth.isAuthenticated) {
          this.$router.push("/dashboard");
        } else this.$router.push("/sign-in");

  },
};
</script>
