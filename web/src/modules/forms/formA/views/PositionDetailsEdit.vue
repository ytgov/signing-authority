<template>
  <v-container fluid class="down-top-padding">
    <BaseBreadcrumb
      :title="page.title"
      :icon="page.icon"
      :breadcrumbs="breadcrumbs"
    >
    </BaseBreadcrumb>

    <BaseCard
      :showHeader="true"
      :heading="`Delegation of Financial Signing Authority`"
    >
      <template slot="right">
        <v-btn color="primary" @click="close">Save</v-btn>
      </template>
      <v-row>
        <v-col>
          <v-card class="default">
            <v-card-text>
              <table
                border="0"
                cellspacing="0"
                cellpadding="0"
                class="table"
                style="
                                    background-color: white;
                                    width: 100%;
                                    text-align: left;
                                "
              >
                <form-a-table-head> </form-a-table-head>
                <form-a-table-body-edit></form-a-table-body-edit>
              </table>
            </v-card-text>
            <v-card-actions>
              <v-btn color="secondary" @click="addLine">Add line</v-btn>
              <v-spacer></v-spacer>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </BaseCard>
  </v-container>
</template>

<script>
import { mapState, mapActions, mapMutations } from "vuex";
import formATableBodyEdit from "../components/formATable/formATableBodyEdit.vue";
import formATableHead from "../components/formATable/formATableHead.vue";

export default {
  name: "FormAEdit",
  components: {
    formATableBodyEdit,
    formATableHead
  },
  data: () => ({
    page: {
      title: ""
    },
    breadcrumbs: [
      {
        text: "Signing Authorities Home",
        to: "/dashboard"
      },
      {
        text: "",
        to: "",
        exact: true
      },
      {
        text: "Delegations by Position",
        to: "",
        exact: true
      },
      {
        text: "",
        to: "",
        exact: true
      },
      {
        text: "Edit"
      }
    ],
    department: {},
    authority: {},
    showUpload: false
  }),
  computed: {
    ...mapState("department", ["departments"]),
    ...mapState("authority/formA", ["formA"])
  },
  async mounted() {
    this.id = this.$route.params.formAId;
    let departmentId = this.$route.params.departmentId;
    this.department = await this.getDepartment({ id: departmentId });

    this.breadcrumbs[1].text = this.department.descr;
    this.breadcrumbs[1].to = `/departments/${departmentId}`;
    this.breadcrumbs[2].to = `/departments/${departmentId}/positions`;

    // this.breadcrumbs[4].text = "Positions";
    //this.page.title = this.department.descr;
    let formA = await this.loadFormA({ id: this.$route.params.formAId });

    this.page.title = `${formA.program_branch}: ${formA.position}`;
    this.breadcrumbs[3].text = this.page.title;
    this.breadcrumbs[3].to = `/departments/${departmentId}/positions/${this.id}`;
  },
  methods: {
    ...mapActions("department", ["getDepartment"]),
    ...mapActions("authority/formA", ["loadFormA", "saveFormA"]),
    ...mapMutations("authority/formA", ["setFormA"]),

    addLine() {
      this.formA.authority_lines.push({
        coding: this.formA.department_code,
        contracts_for_goods_services: "",
        loans_and_guarantees: "",
        transfer_payments: "",
        authorization_for_travel: "",
        request_for_goods_services: "",
        assignment_authority: "",
        s29_performance_limit: "",
        s30_payment_limit: ""
      });
      this.setFormA(this.formA);
    },

    close() {
      this.saveFormA(this.formA);
      this.$router.push(
        `/departments/${this.formA.department_code}/positions/${this.formA._id}`
      );
    }
  }
};
</script>
<style scoped>
.table {
  border-collapse: collapse;
}
</style>
