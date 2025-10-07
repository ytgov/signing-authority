<template>
  <v-container fluid class="down-top-padding">
    <BaseBreadcrumb :title="page.title" :icon="page.icon" :breadcrumbs="breadcrumbs">
      <template v-slot:right>
        <!-- <timed-message ref="messager" class="mr-4"></timed-message> -->
      </template>
    </BaseBreadcrumb>

    <BaseCard :showHeader="false">
      <v-stepper v-model="stepperValue" elevation="0" class="mb-5" style="margin-top: -15px">
        <v-stepper-header>
          <v-stepper-step step="1" :complete="stepperValue > 1">
            Locked for Signatures
            <small class="mt-1">{{ lockDate }}</small>
            <small>{{ lockName }}</small>
          </v-stepper-step>
          <v-divider></v-divider>

          <v-stepper-step
            step="2"
            :complete="stepperValue > 2"
            :color="financeReviewRejected ? 'error' : 'primary'"
            :rules="[() => !financeReviewRejected]"
            error
          >
            Dept of Finance Review
            <small class="mt-1">{{ financeReviewDate }}</small>
            <small>{{ financeReviewName }}</small>
          </v-stepper-step>
          <v-divider></v-divider>

          <v-stepper-step step="3" :complete="stepperValue > 3">
            Upload Signed Form A
            <small class="mt-1">{{ signatureDate }}</small>
            <small class="mt-1">{{ signatureName }}</small>
          </v-stepper-step>
          <v-divider></v-divider>

          <v-stepper-step
            step="4"
            :complete="stepperValue > 4"
            :color="financeApproveRejected ? 'error' : 'primary'"
            :rules="[() => !financeApproveRejected]"
          >
            Dept of Finance Approval
            <small class="mt-1">{{ financeApproveDate }}</small>
            <small>{{ financeApproveName }}</small>
          </v-stepper-step>
          <v-divider></v-divider>

          <v-stepper-step step="5" :complete="stepperValue > 5">
            {{ item.status == "Archived" ? "Archived" : "Active" }}
            <small>{{ archiveDate }}</small>
          </v-stepper-step>
        </v-stepper-header>
      </v-stepper>

      <v-alert dense v-if="this.item.finance_review_reject" type="error">
        Department of Finance comments:<br />
        <span style="font-weight: 300">{{ this.item.finance_review_reject.comments }}</span>
      </v-alert>

      <v-alert dense v-if="this.item.finance_approval_reject" type="error">
        Department of Finance comments:<br />
        <span style="font-weight: 300">{{ this.item.finance_approval_reject.comments }}</span>
      </v-alert>

      <v-row>
        <v-col cols="12">
          <v-card class="default">
            <div
              style="float: right; margin-right: 15px; margin-top: 15px"
              v-if="userIsSysAdmin || userIsFinanceAdmin || userIsDeptAdmin"
            >
              <v-menu offset-y left>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn color="secondary" small v-bind="attrs" v-on="on" class="mt-2">
                    Actions
                    <v-icon>mdi-chevron-down</v-icon>
                  </v-btn>
                </template>
                <v-list dense>
                  <v-list-item @click="downloadPDF" v-if="canDownload">
                    <v-list-item-title>Download Form A PDF</v-list-item-title>
                  </v-list-item>

                  <v-list-item @click="startFinanceReview" v-if="canFinanceReview">
                    <v-list-item-title>Finance Review</v-list-item-title>
                  </v-list-item>

                  <v-list-item @click="startFinanceApprove" v-if="canFinanceApprove">
                    <v-list-item-title>Finance Approve</v-list-item-title>
                  </v-list-item>

                  <v-list-item @click="startUploadReview" v-if="canUpload">
                    <v-list-item-title>Upload Signed Form A</v-list-item-title>
                  </v-list-item>

                  <v-list-item @click="showPreview">
                    <v-list-item-title>Show Preview</v-list-item-title>
                  </v-list-item>

                  <v-list-item @click="downloadPreview">
                    <v-list-item-title>Download Preview</v-list-item-title>
                  </v-list-item>

                  <v-list-item @click="startUnlock" v-if="canUnlock">
                    <v-list-item-title>Unlock and Rewind</v-list-item-title>
                  </v-list-item>

                  <v-list-item color="warning" @click="archiveGrouping" v-if="canArchive">
                    <v-list-item-title>
                      Archive
                    </v-list-item-title>
                  </v-list-item>
                  <v-list-item color="warning" @click="deleteGrouping" v-if="canDelete">
                    <v-list-item-title>
                      Delete
                    </v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>

            <div style="float: right;margin-right: 15px;margin-top: 20px;" v-if="isNextActor">
              <div
                class="mr-3"
                style="line-height: 16px; text-align:right"
                v-if="
                  !financeReviewRejected && !financeApproveRejected && stepperValue < 6 && item.status != 'Archived'
                "
              >
                <small>
                  Next Action:
                  <a @click="nextAction">{{ nextStep }}</a
                  ><br />
                  Taken by: {{ nextActor }}
                </small>
              </div>
            </div>
            <div v-else style="float: right;margin-right: 15px;margin-top: 20px;">
              <div
                class="mr-3"
                style="line-height: 16px; text-align:right"
                v-if="
                  !financeReviewRejected && !financeApproveRejected && stepperValue < 6 && item.status != 'Archived'
                "
              >
                <small>
                  Next Action:
                  {{ nextStep }}
                  <br />
                  Taken by: {{ nextActor }}
                </small>
              </div>
            </div>

            <v-card-title> Positions on this Form A </v-card-title>
            <v-card-subtitle>
              Program: <strong>{{ item.program }}</strong> &nbsp; &nbsp; Activity:
              <strong>{{ item.activity }}</strong>
            </v-card-subtitle>
            <v-card-text>
              <v-data-table
                :headers="headers"
                :items="item.positions"
                @click:row="openFormA"
                :class="{ 'row-clickable': item.status != 'Archived' }"
                :footer-props="{
                  'items-per-page-options': [25, 50, 75, -1],
                }"
                :items-per-page="50"
              >
                <template v-slot:item.program_branch="{ item }">
                  {{ item.program_branch }}<span v-if="item.activity"> : {{ item.activity }}</span>
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </BaseCard>

    <v-dialog v-model="showFinanceReviewDialog" persistent width="600">
      <v-app-bar dark color="#0097A9">
        <v-toolbar-title>Department of Finance Review</v-toolbar-title>
        <v-spacer />
        <v-icon title="Close" @click="showFinanceReviewDialog = false">mdi-close</v-icon>
      </v-app-bar>
      <v-card tile>
        <v-card-text class="pt-3">
          <p>
            By clicking the 'Approve' button below, you are verifying that you have reviewed the draft Form A, and that
            it is ready to move forward in the process.
          </p>
          <p>
            If the Form A has errors, provide detail in the dialogue box below for the department to rectify the errors,
            then click 'Reject'.
          </p>
          <p>Departmental finance admins will receive an email notification when you complete this step.</p>

          <v-textarea rows="3" dense outlined label="Comments" hide-details v-model="item.comments"></v-textarea>

          <v-btn @click="financeReviewApprove" color="primary" class="mb-0 mr-5">Approve</v-btn>
          <v-btn @click="financeReviewReject" color="error" class="mb-0" :disabled="!item.comments">Reject</v-btn>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showUploadDialog" persistent width="600">
      <v-app-bar dark color="#0097A9">
        <v-toolbar-title>Upload Signed Form A</v-toolbar-title>
        <v-spacer />
        <v-icon title="Close" @click="showUploadDialog = false">mdi-close</v-icon>
      </v-app-bar>
      <v-card tile>
        <v-card-text class="pt-3">
          <p>Please ensure both signatures are on the uploaded Form A.</p>

          <v-checkbox
            label="Signed by Departmental Finance Director or equivalent"
            dense
            outlined
            hide-details
            v-model="item.supervisor_signed"
          ></v-checkbox>

          <v-checkbox
            label="Signed by Deputy Minister or equivalent"
            dense
            outlined
            v-model="item.employee_signed"
          ></v-checkbox>

          <v-file-input
            dense
            outlined
            accept="application/pdf"
            label="Signed Form A"
            v-model="item.file"
          ></v-file-input>

          <p>Department of Finance admins will receive an email notification that you have completed this step.</p>
          <v-btn @click="uploadSigned" color="primary" class="mb-0" :disabled="!uploadIsValid">Upload</v-btn>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showFinanceApproveDialog" persistent width="600">
      <v-app-bar dark color="#0097A9">
        <v-toolbar-title>Department of Finance Approval</v-toolbar-title>
        <v-spacer />
        <v-icon title="Close" @click="showFinanceApproveDialog = false">mdi-close</v-icon>
      </v-app-bar>
      <v-card tile>
        <v-card-text class="pt-3">
          <p>
            By clicking the 'Approve' button below, you are verifying that you have reviewed the uploaded Form A.
            Clicking 'Approve' will activate the Form A and all positions contained within.
          </p>

          <p>
            If the Form A has errors, provide detail in the dialogue box below for the department to rectify the errors,
            then click 'Reject'
          </p>

          <p>Departmental Finance Administrators will receive an email notification when you complete this step.</p>

          <v-textarea rows="3" dense outlined label="Comments" hide-details v-model="item.comments"></v-textarea>

          <v-btn @click="financeApproveApprove" color="primary" class="mb-0 mr-5">Approve</v-btn>
          <v-btn @click="financeApproveReject" color="error" class="mb-0" :disabled="!item.comments">Reject</v-btn>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showGenerateDialog" persistent width="600">
      <v-app-bar dark color="#0097A9">
        <v-toolbar-title>Gererate Form A</v-toolbar-title>
        <v-spacer />
        <v-icon title="Close" @click="showGenerateDialog = false">mdi-close</v-icon>
      </v-app-bar>
      <v-card tile>
        <v-card-text class="pt-3"> </v-card-text>
      </v-card>
    </v-dialog>

    <pdf-preview-dialog ref="pdfPreview"></pdf-preview-dialog>
  </v-container>
</template>

<script>
import { mapActions, mapState } from "vuex";
import moment from "moment";
import { AUTHORITY_URL, FORMA_URL } from "@/urls";
import PdfPreviewDialog from "@/components/PdfPreviewDialog.vue";

export default {
  components: { PdfPreviewDialog },
  name: "DepartmentPendingGroups",
  data: () => ({
    loading: false,
    headers: [
      { text: "Program : Activity", value: "program_branch" },
      { text: "Position", value: "position" },
      { text: "Status", value: "status" },
      { text: "Authority Lines", value: "authority_lines.length" },
    ],
    page: {
      title: "Form As",
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
        text: "Form As",
        to: "",
        exact: true,
      },
      {
        text: "Detail",
        disabled: true,
      },
    ],

    item: { positions: [] },
    departmentId: null,
    formAId: null,
    showGenerateDialog: false,

    comments: "",

    showFinanceReviewDialog: false,
    showFinanceApproveDialog: false,
    showUploadDialog: false,
  }),
  mounted: async function() {
    this.departmentId = this.$route.params.departmentId;
    this.formAId = this.$route.params.formAId;
    this.item = await this.getDepartment({ id: this.departmentId });

    this.breadcrumbs[1].to = `/departments/${this.departmentId}`;
    this.breadcrumbs[1].text = this.item.descr;

    this.breadcrumbs[2].to = `/departments/${this.departmentId}/form-a`;

    this.loadFormA();
  },
  computed: {
    ...mapState("home", ["profile"]),

    userIsSysAdmin() {
      return this.profile && this.profile.roles && this.profile.roles.includes("System Admin");
    },
    userIsDeptAdmin() {
      return (
        this.profile &&
        this.profile.roles &&
        this.profile.roles.includes("Form A Administrator") &&
        this.profile.department_admin_for.includes(this.departmentId)
      );
    },
    userIsFinanceAdmin() {
      return this.profile && this.profile.roles && this.profile.roles.includes("Department of Finance");
    },

    pdfURL: function() {
      return `${FORMA_URL}/${this.item._id}/pdf`;
    },
    stepperValue() {
      if (this.item) {
        if (this.item.finance_approval_complete) {
          return 6;
        }
        if (this.item.upload_signatures) {
          return 4;
        }
        if (this.item.finance_review_complete) {
          return 3;
        }

        return 2;
      }

      return 1;
    },
    nextStep() {
      if (this.stepperValue == 2) return "Finance Review";
      if (this.stepperValue == 3) return "Upload Signatures";
      if (this.stepperValue == 4) return "Finance Approve";
      return "Active";
    },
    nextAction() {
      if (this.stepperValue == 2) return this.startFinanceReview;
      if (this.stepperValue == 3) return this.startUploadReview;
      if (this.stepperValue == 4) return this.startFinanceApprove;
      return () => {
        console.log("UNSURE");
      };
    },
    nextActor() {
      if (this.stepperValue == 2) return "Department of Finance";
      if (this.stepperValue == 3) return "Department Admin";
      if (this.stepperValue == 4) return "Department of Finance";
      return "Department of Finance";
    },
    isNextActor() {
      if (this.userIsSysAdmin) return true;
      if (this.stepperValue == 2 && this.userIsFinanceAdmin) return true;
      if (this.stepperValue == 3 && this.userIsDeptAdmin) return true;
      if (this.stepperValue == 4 && this.userIsFinanceAdmin) return true;

      return false;
    },

    canArchive() {
      return (this.userIsSysAdmin || this.userIsDeptAdmin) && this.item.status != "Archived" && this.stepperValue > 5;
    },
    canDelete() {
      return (
        (this.userIsSysAdmin || this.userIsDeptAdmin) && this.item.status != "Active" && this.item.status != "Archived"
      );
    },
    canDownload() {
      return this.item.finance_review_complete;
    },
    financeReviewRejected() {
      return this.item.finance_review_reject ? true : false;
    },
    financeApproveRejected() {
      return this.item.finance_approval_reject ? true : false;
    },
    canFinanceReview() {
      if (this.stepperValue == 2 && !this.item.finance_review_reject && this.item.status != "Archived") {
        if (this.userIsFinanceAdmin || this.userIsSysAdmin) return true;
      }
      return false;
    },
    canUpload() {
      if (
        this.stepperValue == 3 &&
        !this.item.finance_review_reject &&
        this.item.status != "Archived" &&
        (this.userIsDeptAdmin || this.userIsSysAdmin)
      )
        return true;
      return false;
    },
    canFinanceApprove() {
      if (
        this.stepperValue == 4 &&
        !this.item.finance_review_reject &&
        !this.item.finance_approval_reject &&
        this.item.status != "Archived"
      ) {
        if (this.userIsFinanceAdmin || this.userIsSysAdmin) return true;
      }
      return false;
    },
    uploadIsValid() {
      if (this.item.supervisor_signed && this.item.employee_signed && this.item.file) return true;
      return false;
    },
    canUnlock() {
      if (this.stepperValue >= 3 && !this.item.finance_approval_complete) {
        if (this.userIsSysAdmin || this.userIsDeptAdmin) return true;
      }
      return false;
    },
    lockDate() {
      return "On " + moment(this.item.create_date).format("MMM D, YYYY @ h:mm a");
    },
    lockName() {
      return "By " + this.item.created_by;
    },
    financeReviewDate() {
      if (this.item.finance_review_complete) {
        return "Approved " + moment(this.item.finance_review_complete.date).format("MMM D, YYYY @ h:mm a");
      } else if (this.item.finance_review_reject) {
        return "Rejected " + moment(this.item.finance_review_reject.date).format("MMM D, YYYY @ h:mm a");
      }
      return "";
    },
    financeReviewName() {
      if (this.item.finance_review_complete) {
        return "By " + this.item.finance_review_complete.name;
      } else if (this.item.finance_review_reject) {
        return "By " + this.item.finance_review_reject.name;
      }
      return "";
    },
    financeApproveDate() {
      if (this.item.finance_approval_complete) {
        return "Approved " + moment(this.item.finance_approval_complete.date).format("MMM D, YYYY @ h:mm a");
      } else if (this.item.finance_approval_reject) {
        return "Rejected " + moment(this.item.finance_approval_reject.date).format("MMM D, YYYY @ h:mm a");
      }
      return "";
    },
    financeApproveName() {
      if (this.item.finance_approval_complete) {
        return "By " + this.item.finance_approval_complete.name;
      } else if (this.item.finance_approval_reject) {
        return "By " + this.item.finance_approval_reject.name;
      }
      return "";
    },
    signatureDate() {
      if (this.item.upload_signatures) {
        return "On " + moment(this.item.upload_signatures.date).format("MMM D, YYYY @ h:mm a");
      }
      return "";
    },
    signatureName() {
      if (this.item.upload_signatures) {
        return "By " + this.item.upload_signatures.name;
      }
      return "";
    },
    archiveDate() {
      if (this.item.status == "Archived") {
        if (this.item.archive_date) {
          return "On " + moment(this.item.archive_date).format("MMM D, YYYY @ h:mm a");
        }
        return "Date Not Recorded"
      }
      return "";
    },
  },
  methods: {
    ...mapActions("department", [
      "getDepartment",
      "getPendingGroups",
      "deletePendingGroup",
      "savePendingGroup",
      "savePendingGroupWithFile",
    ]),
    async loadFormA() {
      let allItems = (this.formAItems = await this.getPendingGroups({
        id: this.departmentId,
      }));

      this.item = allItems.filter((i) => i._id == this.formAId)[0];

      if (this.item.activated_positions) this.item.positions = this.item.activated_positions;

      this.loading = false;
    },
    openFormA(item) {
      if (this.item.status == "Archived") return;
      this.$router.push(`/departments/${this.departmentId}/positions/${item._id}`);
    },
    showPreview() {
      if (this.item.upload_signatures) {
        this.$refs.pdfPreview.show(
          "Signed Form A",
          `${AUTHORITY_URL}/uploads/${this.item.upload_signatures.file_id}/file`
        );
      } else {
        this.$refs.pdfPreview.show("Form A Preview", this.pdfURL);
      }
    },
    downloadPreview() {
      window.open(`${this.pdfURL}/draft`);
    },
    async archiveGrouping() {
      this.item.status = "Archived";
      this.savePendingGroup(this.item)
        .then((resp) => {
          if (resp) this.$router.push(`/departments/${this.departmentId}/form-a`);
        })
        .catch((e) => {
          console.log("ERROR IN ARCHVE", e);
        });
    },
    async deleteGrouping() {
      this.deletePendingGroup(this.item).then(() => {
        this.$router.push(`/departments/${this.departmentId}/form-a`);
      });
    },
    async downloadPDF() {
      if (this.item.upload_signatures)
        window.open(`${AUTHORITY_URL}/uploads/${this.item.upload_signatures.file_id}/file`);
      else window.open(this.pdfURL);
    },

    startFinanceReview() {
      this.showFinanceReviewDialog = true;
    },
    async financeReviewApprove() {
      this.item.save_action = "FinanceReviewApprove";

      this.savePendingGroup(this.item).then(() => {
        this.loadFormA();
        this.showFinanceReviewDialog = false;
      });
    },
    async financeReviewReject() {
      this.item.save_action = "FinanceReviewReject";

      this.savePendingGroup(this.item).then(() => {
        this.loadFormA();
        this.showFinanceReviewDialog = false;
      });
    },

    startUploadReview() {
      this.showUploadDialog = true;
    },
    async uploadSigned() {
      this.item.save_action = "UploadSignatures";

      this.savePendingGroupWithFile(this.item).then(() => {
        this.loadFormA();
        this.showUploadDialog = false;
      });
    },

    startFinanceApprove() {
      this.showFinanceApproveDialog = true;
    },

    async financeApproveApprove() {
      this.item.save_action = "FinanceApproveApprove";

      this.savePendingGroup(this.item).then(() => {
        this.loadFormA();
        this.showFinanceApproveDialog = false;
      });
    },
    async financeApproveReject() {
      this.item.save_action = "FinanceApproveReject";

      this.savePendingGroup(this.item).then(() => {
        this.loadFormA();
        this.showFinanceApproveDialog = false;
      });
    },

    startUnlock() {
      this.item.save_action = "Reset";

      this.savePendingGroup(this.item).then(() => {
        this.loadFormA();
      });
    },

    generateFormAClick() {
      this.showGenerateDialog = true;
    },
  },
};
</script>
