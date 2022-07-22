
<template>
  <v-container fluid class="down-top-padding">
    <BaseBreadcrumb
      :title="page.title"
      :icon="page.icon"
      :breadcrumbs="breadcrumbs"
    >
    </BaseBreadcrumb>

    <BaseCard
      showHeader="true"
      :heading="`Delegation of Financial Signing Authority - FORM A`"
    >
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
    </BaseCard>
  </v-container>
</template>



<script>
import { mapState, mapActions } from "vuex";
import formATableBodyEdit from "../components/formATable/formATableBodyEdit.vue";
import formATableHead from "../components/formATable/formATableHead.vue";

export default {
  name: "FormAEdit",
  components: {
    formATableBodyEdit,
    formATableHead,
  },
  data: () => ({
    page: {
      title: "",
    },
    breadcrumbs: [
      {
        text: "Signing Authorities Home",
        to: "/dashboard",
      },
      {
        text: "",
        to: "",
        exact: true,
      },
      {
        text: "Form A Authorizations",
        to: "",
        exact: true,
      },
      {
        text: "",
        to: "",
      },
    ],
    department: {},
    authority: {},
    showUpload: false,
  }),
  computed: {
    ...mapState("department", ["departments"]),
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
    this.id = this.$route.params.formAId;
    let departmentId = this.$route.params.departmentId;
    this.department = await this.getDepartment({ id: departmentId });

    this.breadcrumbs[1].text = this.department.descr;
    this.breadcrumbs[1].to = `/departments/${departmentId}`;
    this.breadcrumbs[2].to = `/departments/${departmentId}/form-a`;

    // this.breadcrumbs[4].text = "Positions";
    //this.page.title = this.department.descr;
    let formA = await this.loadFormA({ id: this.$route.params.formAId });

    this.page.title = `${formA.program_branch}: ${formA.position}`;
    this.breadcrumbs[3].text = this.page.title;
  },
  methods: {
    ...mapActions("department", ["getDepartment"]),
    ...mapActions("authority/formA", ["loadFormA", "saveFormA"]),

    addLine() {
      this.formA.authority_lines.push({
        account: `${this.formA.department_code}*`,
      });
    },

    close() {
      this.$router.push(`/departments/${this.formA.department_code}/form-a/${this.formA._id}`);
    },
  },
};
</script>
<style scoped>
.table {
  border-collapse: collapse;
}
</style>