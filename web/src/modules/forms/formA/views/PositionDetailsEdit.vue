<template>
  <v-container fluid class="down-top-padding">
    <BaseBreadcrumb :title="page.title" :icon="page.icon" :breadcrumbs="breadcrumbs"> </BaseBreadcrumb>

    <BaseCard :showHeader="true" :heading="`Delegation of Financial Signing Authority`">
      <template slot="right">
        <v-chip color="#f2a900" v-if="formA.is_deputy_minister || formA.is_deputy_duplicate" class="mr-4" dark
          >Deputy Minister or Equivalent</v-chip
        >
        <v-btn color="primary" small class="mr-5" text @click="close">Cancel</v-btn>
        <v-btn color="primary" @click="save" :disabled="!canSave">Save</v-btn>
        <div style="display:none">{{ version }}</div>
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
                style="background-color: white;width: 100%;text-align: left;"
              >
                <form-a-table-head> </form-a-table-head>
                <form-a-table-body-edit :saveError="saveError"></form-a-table-body-edit>
              </table>
              <div class="d-flex">
                <v-btn color="secondary" small class="mb-0" @click="addLine">Add line</v-btn>
                <v-spacer />
                <span class="text-error pt-5" v-if="saveError">Error Saving Position: {{ saveError.error }}</span>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </BaseCard>
  </v-container>
</template>

<script>
import { mapState, mapActions, mapMutations } from "vuex";
import _ from "lodash";
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
        text: "Delegations by Position",
        to: "",
        exact: true,
      },
      {
        text: "",
        to: "",
        exact: true,
      },
      {
        text: "Edit",
      },
    ],
    departmentId: "",
    department: {},
    //authority: {},
    showUpload: false,
    saveError: null,
  }),
  computed: {
    ...mapState("department", ["departments"]),
    ...mapState("authority/formA", ["formA", "version"]),
    ...mapState("home", ["profile"]),

    canSave() {
      if (this.formA && this.formA.authority_lines && this.formA.authority_lines.length > 0) {
        for (let line of this.formA.authority_lines) {
          if (line.coding_invalid || line.is_working) {
            return false;
          }
        }

        return true;
      }
      return false;
    },

    canAdminister() {
      if (this.profile && this.profile.roles && this.profile.roles.length > 0) {
        if (this.profile.roles.includes("System Admin")) return true;

        if (
          this.profile.roles.includes("Form A Administrator") &&
          this.profile.department_admin_for.includes(this.departmentId)
        )
          return true;
      }

      return false;
    },
  },
  async mounted() {
    this.id = this.$route.params.formAId;
    this.departmentId = this.$route.params.departmentId;
    this.department = await this.getDepartment({ id: this.departmentId });

    this.breadcrumbs[1].text = this.department.descr;
    this.breadcrumbs[1].to = `/departments/${this.departmentId}`;
    this.breadcrumbs[2].to = `/departments/${this.departmentId}/positions`;

    // this.breadcrumbs[4].text = "Positions";
    //this.page.title = this.department.descr;
    let formA = await this.loadFormA({ id: this.$route.params.formAId });

    this.page.title = formA.program_branch ? `${formA.program_branch}: ${formA.position}` : formA.position;
    this.breadcrumbs[3].text = this.page.title;
    this.breadcrumbs[3].to = `/departments/${this.departmentId}/positions/${this.id}`;

    if (!this.canAdminister || this.formA.status == "Active") this.$router.push(this.breadcrumbs[3].to);
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
        s30_payment_limit: "",
      });
      this.setFormA(this.formA);
    },

    close() {
      this.$router.push(`/departments/${this.formA.department_code}/positions/${this.formA._id}`);
    },

    async save() {
      this.saveError = null;
      let resp = await this.saveFormA(this.formA);

      if (resp) {
        if (resp.status && _.isNumber(resp.status) && resp.status != 200) {
          this.saveError = resp.data;
        } else this.close();
      }
    },
  },
};
</script>
<style scoped>
.table {
  border-collapse: collapse;
}
</style>
