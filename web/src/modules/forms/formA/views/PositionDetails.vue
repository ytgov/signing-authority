<template>
  <v-container fluid class="down-top-padding">
    <BaseBreadcrumb :title="page.title" :icon="page.icon" :breadcrumbs="breadcrumbs"> </BaseBreadcrumb>

    <BaseCard :showHeader="true" heading="Delegation of Financial Signing Authority">
      <template slot="right">
        <v-chip color="#f2a900" v-if="formA.is_deputy_minister || formA.is_deputy_duplicate" class="mr-4" dark>Deputy Minister or Equivalent</v-chip>
        <form-a-status :isLocked="isLocked" :status="status"> </form-a-status>

        <actions-menu :showPreview="showPreview" :showDMApprove="showDMApprove"> </actions-menu>
      </template>
      <v-overlay :value="is_loading"> <v-progress-circular indeterminate size="64"></v-progress-circular></v-overlay>

      <v-card class="default">
        <v-card-text>
          <formATable :formA="formA"></formATable>
        </v-card-text>
      </v-card>

      <v-row class="mt-3">
        <v-col>
          <v-card class="default">
            <v-card-title>Related Form B Authorizations</v-card-title>
            <v-card-text>
              <v-data-table
                dense
                :headers="[
                  { text: 'Name', value: 'employee.name' },
                  { text: 'Title', value: 'employee.title' },
                  { text: 'Status', value: 'status' },
                ]"
                :items="formA.active_authorities"
                @click:row="openFormB"
                class="row-clickable"
              />
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="6">
          <v-card class="default">
            <v-card-title>Audit History</v-card-title>
            <v-card-text>
              <v-data-table
                dense
                :headers="[
                  { text: 'Date', value: 'date_display' },
                  { text: 'User', value: 'user_name' },
                  { text: 'Action', value: 'action' },
                ]"
                :items="formA.audit_lines"
                :sort-by="['date']"
                :sort-desc="[true]"
              />
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </BaseCard>

    <v-dialog v-model="showDMApproveDialog" persistent width="600">
      <v-app-bar dark color="#0097A9">
        <v-toolbar-title>Deputy Minister or Equivalent Approval</v-toolbar-title>
        <v-spacer />
        <v-icon title="Close" @click="showDMApproveDialog = false">mdi-close</v-icon>
      </v-app-bar>
      <v-card tile>
        <v-card-text class="pt-3">
          <p>
            By clicking the 'Approve' button below, you are verifying that you have reviewed the Deputy Minister or
            Equivalent position. Clicking 'Approve' will activate this position.
          </p>

          <p>
            If the Position has errors, provide detail in the dialogue box below for the department to rectify the
            errors, then click 'Reject'
          </p>

          <p>Departmental Finance Administrators will receive an email notification when you complete this step.</p>

          <v-textarea rows="3" dense outlined label="Comments" hide-details v-model="reviewComments"></v-textarea>

          <v-btn @click="financeDMApprove" color="primary" class="mb-0 mr-5">Approve</v-btn>
          <v-btn @click="financeDMReject" color="error" class="mb-0" :disabled="!reviewComments">Reject</v-btn>
        </v-card-text>
      </v-card>
    </v-dialog>

    <pdf-preview-dialog ref="pdfPreview"></pdf-preview-dialog>
  </v-container>
</template>

<script>
import { AUTHORITY_URL } from "@/urls";
import { mapActions, mapState, mapGetters } from "vuex";
import moment from "moment";
import formATable from "../components/formATable.vue";
import ActionsMenu from "../components/actionsMenu.vue";
import FormAStatus from "../components/formAStatus/formAStatus.vue";
import PdfPreviewDialog from "@/components/PdfPreviewDialog.vue";

export default {
  name: "AuthorityDetails",
  components: {
    formATable,
    ActionsMenu,
    FormAStatus,
    PdfPreviewDialog,
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
      },
    ],
    departmentId: "",
    department: {},
    authority: {},
    showUpload: false,
    showDMApproveDialog: false,
    reviewComments: "",
  }),
  computed: {
    ...mapState("department", ["departments"]),
    ...mapState("authority/formA", ["formA", "is_loading"]),
    ...mapGetters("authority/formA", ["isLocked", "status"]),
    ...mapState("home", ["profile"]),

    activationDate() {
      if (this.formA.activation) return moment(this.formA.activation.date).format("MMM D, YYYY @ h:mm a");
      return "";
    },
  },
  async mounted() {
    this.id = this.$route.params.id;
    this.departmentId = this.$route.params.departmentId;
    this.department = await this.getDepartment({ id: this.departmentId });

    this.breadcrumbs[1].text = this.department.descr;
    this.breadcrumbs[1].to = `/departments/${this.departmentId}`;
    this.breadcrumbs[2].to = `/departments/${this.departmentId}/positions`;

    let formA = await this.loadFormA({ id: this.$route.params.formAId });
    this.page.title = formA.program_branch ? `${formA.program_branch}: ${formA.position}` : formA.position;
    this.breadcrumbs[3].text = this.page.title;
  },
  methods: {
    ...mapActions("department", ["getDepartment"]),
    ...mapActions("authority/formA", ["loadFormA", "saveFormA"]),

    openFormB(item) {
      this.$router.push(`/form-b/${item._id}`);
    },
    showPreview() {
      this.$refs.pdfPreview.show("Signed Form A", `${AUTHORITY_URL}/uploads/${this.formA.activation.file_id}/file`);
    },

    showDMApprove() {
      this.showDMApproveDialog = true;
    },

    async financeDMApprove() {
      this.formA.save_action = "DMApprove";

      await this.saveFormA(this.formA);
      this.showDMApproveDialog = false;
    },

    async financeDMReject() {
      this.formA.save_action = "DMReject";
      this.formA.comments = this.reviewComments;

      await this.saveFormA(this.formA);
      this.showDMApproveDialog = false;
    },
  },
};
</script>
