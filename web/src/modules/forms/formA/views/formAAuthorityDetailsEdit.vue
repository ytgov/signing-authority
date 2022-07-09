
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
              <form-a-table-head
                :formA="formA"
                :edit="formATableBodyEdit"> </form-a-table-head>
              <form-a-table-body-edit
                :formA="formA">
              </form-a-table-body-edit>
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
// import AuthorityMetadataCard from "../components/authorityMetadataCard.vue";
// import { formATable } from "../components/formATable.vue"

export default {
  name: "AuthorityDetails",
  components: {
    formATableBodyEdit,
    formATableHead
    // AuthorityMetadataCard,
    // formATable
  },
  data: () => ({

    edit: true,
    authority: {},
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
    removeLine(idx) {
      this.formA.authority_lines.splice(idx, 1);
      this.saveFormB(this.formA);
    },
    itemChanged() {
      this.saveFormA(this.formA);
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
.table th {
  text-align: center;
}
.table thead {
  text-transform: uppercase;
}
.table th,
.table td {
  border: 1px black solid;
}

.table th.rotate {
  height: 200px;
  white-space: nowrap;
  vertical-align: bottom;
  padding-bottom: 20px;
  max-width: 80px;
}
table th.bottom {
  white-space: nowrap;
  vertical-align: bottom;
  width: 175px;
  padding-left: 10px;
  text-align: left;
}

.table th.rotate > div {
  transform: rotate(270deg);
  width: 58px;
}
.table .fb-value {
  width: 60px;
  text-align: center;
}
</style>