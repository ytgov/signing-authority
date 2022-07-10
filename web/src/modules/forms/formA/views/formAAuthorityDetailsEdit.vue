
<template>
  <div>
    <v-breadcrumbs :items="breadcrumbs"></v-breadcrumbs>

    <h1>Form A for {{ formA.program_branch }}</h1>
    <!-- <v-row>
      <v-col>
        <authority-metadata-card :formB="formB" @close="close" />
      </v-col>
    </v-row> -->
    <v-row>
      <v-col>
        <v-card class="default">
          <v-card-text>
            <table
              border="0"
              cellspacing="0"
              cellpadding="0"
              class="table"
              style="background-color: white; width: 100%; text-align: left"
            >
              <form-a-table-head> </form-a-table-head>
              <form-a-table-body-edit></form-a-table-body-edit>
            </table>
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" @click="addLine">Add line</v-btn>
            <v-spacer></v-spacer>
            <v-btn color="#7A9A01" @click="close">Close</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog></v-dialog>
  </div>
</template>



<script>
import { mapState, mapActions } from "vuex";
import formATableBodyEdit from '../components/formATable/formATableBodyEdit.vue';
import formATableHead from '../components/formATable/formATableHead.vue';

export default {
  name: "FormAEdit",
  components: {
    formATableBodyEdit,
    formATableHead
  },
  data: () => ({
    showUpload: false,
  }),
  computed: {
    ...mapState("authority/formA", ["formA"]),
    // employeeFullName: function () {
    //   return `${this.formB.employee.first_name} ${this.formB.employee.last_name}`;
    // },

    breadcrumbs: function () {
      let b = [{ text: "Dashboard", to: "/dashboard" }];
      b.push({
        text: `Form A: ${this.formA.department_descr} - ${this.formA.program_branch})`,
        to: `/form-a/${this.formA._id}`,
        exact: true,
      });
      b.push({ text: "Edit" });
      return b;
    },
  },
  async mounted() {
    this.loadFormA(this.$route.params.id);
  },
   methods: {
    ...mapActions("authority/formA", ["loadFormA", "saveFormA"]),

    addLine() {
      this.formA.authority_lines.push({"account":`${this.formA.department_code}*`});
    },

    close() {
      this.$router.push(`/form-a/${this.formA._id}`)
    },
  },
};
</script>
<style scoped>
.table {
  border-collapse: collapse;
}
</style>