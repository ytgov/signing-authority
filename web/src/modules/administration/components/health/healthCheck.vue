<template>
  <v-container>
    <v-card class="mt-5 default">
<v-card-title>Health Check</v-card-title>
          <v-card-text>
    <health-object
      v-for="(component,idx) in appHealth"
      :key="idx"
      :title = component.name
      :status = "component.status"
      ></health-object>
</v-card-text>
    </v-card>
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
