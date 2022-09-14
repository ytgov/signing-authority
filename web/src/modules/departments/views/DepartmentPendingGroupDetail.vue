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
            Finance Review
            <small class="mt-1">{{ financeReviewDate }}</small>
            <small>{{ financeReviewName }}</small>
          </v-stepper-step>
          <v-divider></v-divider>

          <v-stepper-step step="3" :complete="stepperValue > 3">
            Upload Signatures
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
            Finance Approve
            <small class="mt-1">{{ financeApproveDate }}</small>
            <small>{{ financeApproveName }}</small>
          </v-stepper-step>
          <v-divider></v-divider>

          <v-stepper-step step="5" :complete="stepperValue > 5">
            Active
          </v-stepper-step>
        </v-stepper-header>
      </v-stepper>

      <v-alert dense v-if="this.item.finance_review_reject" type="error">
        Finance Review Comments: <br />
        <span style="font-weight: 300">{{ this.item.finance_review_reject.comments }}</span>
      </v-alert>

      <v-alert dense v-if="this.item.finance_approval_reject" type="error">
        Finance Approve Comments: <br />
        <span style="font-weight: 300">{{ this.item.finance_approval_reject.comments }}</span>
      </v-alert>

      <v-row>
        <v-col cols="12">
          <v-card class="default">
            <div style="float: right; margin-right: 15px; margin-top: 15px">
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
                    <v-list-item-title>Upload Signatures</v-list-item-title>
                  </v-list-item>

                  <v-list-item @click="showPreview">
                    <v-list-item-title>Show Preview</v-list-item-title>
                  </v-list-item>

                  <v-list-item color="warning" @click="deleteGrouping" v-if="canDelete">
                    <v-list-item-title>
                      Delete
                    </v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>

            <div style="float: right;margin-right: 15px;margin-top: 20px;">
              <div
                class="mr-3"
                style="line-height: 16px; text-align:right"
                v-if="!financeReviewRejected && !financeApproveRejected && stepperValue < 6"
              >
                <small>
                  Next Action:
                  <a @click="nextAction">{{ nextStep }}</a
                  ><br />
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
                class="row-clickable"
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
        <v-toolbar-title>Finance Review</v-toolbar-title>
        <v-spacer />
        <v-icon title="Close" @click="showFinanceReviewDialog = false">mdi-close</v-icon>
      </v-app-bar>
      <v-card tile>
        <v-card-text class="pt-3">
          <p>
            By clicking the 'Approve' button below, you are verifying that you have reviewed this draft Form A and that
            it is ready to move forward to the next step, where the department downloads the PDF, obtain signatures and
            uploads the signed copy.
          </p>
          <p>Department admins will recieve an email notification that you have completed this step.</p>

          <v-textarea rows="3" dense outlined label="Comments" hide-details v-model="item.comments"></v-textarea>

          <v-btn @click="financeReviewApprove" color="primary" class="mb-0 mr-5">Approve</v-btn>
          <v-btn @click="financeReviewReject" color="error" class="mb-0">Reject</v-btn>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showUploadDialog" persistent width="600">
      <v-app-bar dark color="#0097A9">
        <v-toolbar-title>Upload Signatures</v-toolbar-title>
        <v-spacer />
        <v-icon title="Close" @click="showUploadDialog = false">mdi-close</v-icon>
      </v-app-bar>
      <v-card tile>
        <v-card-text class="pt-3">
          <p>Please type the names of the individuals that signed this form.</p>
          <v-text-field
            label="Departmental Administrator"
            dense
            outlined
            v-model="item.department_administrator_name"
          ></v-text-field>
          <v-text-field label="Deputy Minister" dense outlined v-model="item.deputy_minister_name"></v-text-field>
          <v-file-input
            dense
            outlined
            accept="application/pdf"
            label="Signed Form A"
            v-model="item.file"
          ></v-file-input>

          <p>Finance admins will recieve an email notification that you have completed this step.</p>
          <v-btn @click="uploadSigned" color="primary" class="mb-0" :disabled="!uploadIsValid">Upload</v-btn>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showFinanceApproveDialog" persistent width="600">
      <v-app-bar dark color="#0097A9">
        <v-toolbar-title>Finance Approve</v-toolbar-title>
        <v-spacer />
        <v-icon title="Close" @click="showFinanceApproveDialog = false">mdi-close</v-icon>
      </v-app-bar>
      <v-card tile>
        <v-card-text class="pt-3">
          <p>
            By clicking the 'Approve' button below, you are verifying that you have reviewed the signed Form A and that
            it is ready to be activated.
          </p>
          <p>Department admins will recieve an email notification that you have completed this step.</p>

          <v-textarea rows="3" dense outlined label="Comments" hide-details v-model="item.comments"></v-textarea>

          <v-btn @click="financeApproveApprove" color="primary" class="mb-0 mr-5">Approve</v-btn>
          <v-btn @click="financeApproveReject" color="error" class="mb-0">Reject</v-btn>
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
import { mapActions } from "vuex";
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
      { text: "Authority Lines", value: "authority_lines.length" },
    ],
    page: {
      title: "Pending Form As",
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
        text: "Pending Form As",
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
      if (this.stepperValue == 2) return "Finance Admin";
      if (this.stepperValue == 3) return "Department Admin";
      if (this.stepperValue == 4) return "Finance Admin";
      return "Finance Admin";
    },
    canDelete() {
      return true;
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
      if (this.stepperValue == 2 && !this.item.finance_review_reject) return true;
      return false;
    },
    canUpload() {
      if (this.stepperValue == 3 && !this.item.finance_review_reject) return true;
      return false;
    },
    canFinanceApprove() {
      if (this.stepperValue == 4 && !this.item.finance_review_reject && !this.item.finance_approval_reject) return true;
      return false;
    },
    uploadIsValid() {
      if (this.item.department_administrator_name && this.item.deputy_minister_name && this.item.file) return true;
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
    async deleteGrouping() {
      this.deletePendingGroup({
        id: this.departmentId,
        groupId: this.item._id,
      }).then(() => {
        this.$router.push(`/departments/${this.departmentId}`);
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

    generateFormAClick() {
      this.showGenerateDialog = true;
    },
    async doGenerateFormA() {
      console.log("ANSWER");
    },
  },
};
</script>
