<template>
  <div>
    <v-row>
      <v-col>
    <v-breadcrumbs :items="breadcrumbs"></v-breadcrumbs>
      </v-col>
    </v-row>
    <v-row>
    <v-col>
    <h1>
      {{ employee.first_name }} {{ employee.last_name }}
      <small> ({{ employee.ynet_id }})</small>
    </h1>
    </v-col>
    <v-spacer></v-spacer>
  <v-col>
     <form-b-upload-modal> </form-b-upload-modal>
  </v-col>
    </v-row>
    <h3>Employee Id: {{ employee.employee_id }}</h3>

    <strong>Authorities:</strong>
    {{ employee.authorities }}
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import formBUploadModal from "../../components/forms/formBUploadModal.vue"
//import store from "../../store";

export default {
  components: { formBUploadModal },
  name: "Login",
  component: {
    formBUploadModal
  },
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
