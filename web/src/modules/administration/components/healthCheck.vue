<template>
  <v-container>
    <health-object
      title = "Database"
      :status = appHealth.database
      ></health-object>
      <health-object
      title = "Department API"
      :status = appHealth.departmentAPI
      ></health-object>

  </v-container>

</template>

<script>
import {mapActions, mapState} from "vuex";
import HealthObject from './healthObject.vue';

export default {
  name: "healthCheck",
  components: {HealthObject},
  data: () => ({}),

  computed: {
    ...mapState("administration", [
       "appHealth"
    ]),

  },
  methods: {
    ...mapActions("administration", [
      "doHealthCheck",
  ])},

  async mounted() {
    await this.doHealthCheck();
  }
}
</script>
