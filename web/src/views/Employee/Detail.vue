<template>
  <div>
    <v-breadcrumbs :items="breadcrumbs"></v-breadcrumbs>
    <h1>
      {{ employee.first_name }} {{ employee.last_name }}
      <small> ({{ employee.ynet_id }})</small>
    </h1>

    <h3>Employee Id: {{ employee.employee_id }}</h3>

    <strong>Authorities:</strong>
    {{ employee.authorities }}
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
//import store from "../../store";

export default {
  name: "Login",
  computed: {
    ...mapGetters("employee", ["employee"]),
    breadcrumbs: function () {
      let b = [{ text: "Employees", to: "/employee" }];
      b.push({
        text: `${this.employee.first_name} ${this.employee.last_name}`,
      });
      return b;
    },
  },
  watch: {},
  data: () => ({}),
  async mounted() {
    this.loadEmployee(this.$route.params.id);
  },
  methods: {
    ...mapActions("employee", ["loadEmployee"]),
  },
};
</script>
