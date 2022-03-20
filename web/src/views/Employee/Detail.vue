<template>
  <div>
    <v-breadcrumbs :items="breadcrumbs"></v-breadcrumbs>

    <h1>
      {{ employee.first_name }} {{ employee.last_name }}
      <small> ({{ employee.ynet_id }})</small>
    </h1>

    <v-row>
      <v-col cols="12" sm="6">
        <h3>Employee Id: {{ employee.employee_id }}</h3>
        <p>First name: {{ employee.first_name }}</p>
        <p>Last name: {{ employee.last_name }}</p>
        <p>YNET Id: {{ employee.ynet_id }}</p>

        <form-b-upload-modal> </form-b-upload-modal>
      </v-col>

      <v-col cols="12" sm="6">
        <h3>Authorities:</h3>

        <div v-for="(item, idx) of employee.authorities" :key="idx">
          <AuthorityRenderer :authority="item"></AuthorityRenderer>
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import formBUploadModal from "../../components/forms/formBUploadModal.vue";
import AuthorityRenderer from "../../components/AuthorityRenderer.vue";
//import store from "../../store";

export default {
  components: { formBUploadModal, AuthorityRenderer },
  name: "Login",
  component: {
    formBUploadModal,
    AuthorityRenderer,
  },
  computed: {
    ...mapGetters("employee", ["employee"]),
    breadcrumbs: function () {
      let b = [{ text: "Dashboard", to: "/dashboard" }];
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
