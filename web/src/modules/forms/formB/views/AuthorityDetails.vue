<template>
  <v-container fluid class="down-top-padding">
    <BaseBreadcrumb :title="page.title" :icon="page.icon" :breadcrumbs="breadcrumbs">
      <template v-slot:right>
        <!-- <timed-message ref="messager" class="mr-4"></timed-message> -->
      </template>
    </BaseBreadcrumb>

    <v-overlay absolute :value="is_loading">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>

    <BaseCard :showHeader="false">
      <template slot="right"> </template>

      <v-stepper v-model="stepperValue" elevation="0" class="mb-5" style="margin-top: -15px">
        <v-stepper-header>
          <v-stepper-step step="1" :complete="stepperValue > 1">
            Created
            <small class="mt-1">{{ createDate }}</small>
            <small>{{ createName }}</small>
          </v-stepper-step>
          <v-divider></v-divider>

          <v-stepper-step step="2" :complete="stepperValue > 2">
            Lock for Signatures
            <small class="mt-1">{{ lockDate }}</small>
            <small>{{ lockName }}</small>
          </v-stepper-step>
          <v-divider></v-divider>

          <v-stepper-step step="3" :complete="stepperValue > 3">
            Upload Signatures
            <small class="mt-1">{{ uploadDate }}</small>
            <small>{{ uploadName }}</small></v-stepper-step
          >
          <v-divider></v-divider>

          <v-stepper-step step="4" :complete="stepperValue > 4">
            Finance Approve
            <small class="mt-1">{{ financeApproveDate }}</small>
            <small>{{ financeApproveName }}</small>
          </v-stepper-step>
          <v-divider></v-divider>

          <v-stepper-step step="5" :complete="stepperValue > 5"> Active </v-stepper-step>
        </v-stepper-header>
      </v-stepper>

      <v-card class="default">
        <div style="float: right; margin-right: 15px; margin-top: 15px">
          <form-b-status :isLocked="isLocked" :isActive="isActive"> </form-b-status>

          <v-menu offset-y left>
            <template v-slot:activator="{ on, attrs }">
              <v-btn color="secondary" small v-bind="attrs" v-on="on" class="mt-2">
                Actions <v-icon>mdi-chevron-down</v-icon>
              </v-btn>
            </template>
            <v-list dense>
              <v-list-item @click="editFormB" v-if="canEdit">
                <v-list-item-title>Edit</v-list-item-title>
              </v-list-item>

              <v-list-item @click="unlockClick" v-if="canUnlock">
                <v-list-item-title>Unlock and Rewind</v-list-item-title>
              </v-list-item>

              <v-list-item @click="generateClick" v-if="canLock">
                <v-list-item-title>Lock for Signatures</v-list-item-title>
              </v-list-item>

              <v-list-item @click="downloadPDF" v-if="canDownload">
                <v-list-item-title>Download PDF</v-list-item-title>
              </v-list-item>

              <v-list-item @click="showPreview">
                <v-list-item-title>Preview PDF</v-list-item-title>
              </v-list-item>

              <v-list-item @click="startUploadReview" v-if="canUpload">
                <v-list-item-title>Upload Signed PDF</v-list-item-title>
              </v-list-item>

              <v-list-item @click="startFinanceApprove" v-if="canApprove">
                <v-list-item-title>Finance Approve</v-list-item-title>
              </v-list-item>

              <v-list-item @click="archiveClick" v-if="canArchive">
                <v-list-item-title>Archive</v-list-item-title>
              </v-list-item>

              <v-list-item @click="duplicateClick" v-if="canDuplicate">
                <v-list-item-title>Duplicate</v-list-item-title>
              </v-list-item>

              <v-list-item color="warning" @click="deleteClick" v-if="canDelete">
                <v-list-item-title>
                  Delete
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>

        <v-card-title>Form B for {{ formB.employee.name }}</v-card-title>

        <v-card-subtitle>
          Department: <strong>{{ formB.department_descr }}</strong> &nbsp; &nbsp; Form A Position:
          <strong>{{ formB.form_a.position }}</strong>
        </v-card-subtitle>

        <v-card-text>
          <form-b-table></form-b-table>
        </v-card-text>
      </v-card>

      <v-row class="mt-3">
        <v-col cols="6">
          <authority-supervisor-card :formB="formB" class="mb-5" />

          <v-card class="default">
            <v-card-title>Related Form A Position</v-card-title>
            <v-card-text>
              <v-text-field
                v-model="formB.form_a.program_branch"
                label="Program"
                dense
                outlined
                background-color="white"
                readonly
                append-icon="mdi-lock"
              ></v-text-field>
              <v-text-field
                v-model="formB.form_a.activity"
                label="Activity"
                dense
                outlined
                readonly
                background-color="white"
                append-icon="mdi-lock"
              ></v-text-field>
              <v-text-field
                v-model="formB.form_a.position"
                label="Position"
                dense
                outlined
                readonly
                background-color="white"
                append-icon="mdi-lock"
              ></v-text-field>

              <v-btn color="primary" small class="my-0" @click="openFormA">Preview Signed Form A</v-btn>
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
                :items="formB.audit_lines"
                :sort-by="['date']"
                :sort-desc="[true]"
              />
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </BaseCard>

    <v-dialog v-model="showUploadDialog" persistent width="700">
      <v-app-bar dark color="#0097A9">
        <v-toolbar-title>Upload Signatures</v-toolbar-title>
        <v-spacer />
        <v-icon title="Close" @click="showUploadDialog = false">mdi-close</v-icon>
      </v-app-bar>
      <v-card tile>
        <v-card-text class="pt-3">
          <p>Please type the names of the individuals that signed this form.</p>
          <v-checkbox
            :label="`Supervisor signed (${formB.supervisor.name} as ${formB.supervisor.title})`"
            dense
            outlined
            hide-details
            v-model="formB.supervisor_signed"
          ></v-checkbox>

          <v-checkbox
            :label="`Employee signed (${formB.employee.name} as ${formB.employee.title})`"
            dense
            outlined
            v-model="formB.employee_signed"
          ></v-checkbox>
          <v-file-input
            dense
            outlined
            accept="application/pdf"
            label="Signed Form B"
            v-model="formB.file"
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
            By clicking the 'Approve' button below, you are verifying that you have reviewed the signed Form B and that
            it is ready to be activated.
          </p>
          <p>Department admins will recieve an email notification that you have completed this step.</p>

          <v-textarea rows="3" dense outlined label="Comments" hide-details v-model="formB.comments"></v-textarea>

          <v-btn @click="financeApproveApprove" color="primary" class="mb-0 mr-5">Approve</v-btn>
          <v-btn @click="financeApproveReject" color="error" class="mb-0">Reject</v-btn>
        </v-card-text>
      </v-card>
    </v-dialog>

    <pdf-preview-dialog ref="pdfPreview"></pdf-preview-dialog>
  </v-container>
</template>

<script>
import { AUTHORITY_URL } from "@/urls";
import moment from "moment";
import { mapGetters, mapActions, mapState } from "vuex";
import PdfPreviewDialog from "@/components/PdfPreviewDialog.vue";

// import uploadFormModal from "../components/uploadFormModal.vue";
//import AuthorityMetadataCard from "../components/cards/authorityMetadataCard.vue";
import AuthoritySupervisorCard from "../components/cards/authoritySupervisorCard.vue";
import FormBStatus from "../components/status/formBStatus.vue";
//import actionsMenu from "../components/menus/actionsMenu.vue";
import FormBTable from "../components/formBTable.vue";

export default {
  name: "AuthorityDetails",
  components: {
    // uploadFormModal,
    //AuthorityMetadataCard,
    AuthoritySupervisorCard,
    FormBStatus,
    PdfPreviewDialog,
    FormBTable,
  },
  data: () => ({
    id: "",
    authority: {},
    showUpload: false,
    page: { title: "" },

    showUploadDialog: false,
    showFinanceApproveDialog: false,
  }),
  computed: {
    ...mapGetters("authority/formB", ["formB"]),
    ...mapState("authority/formB", ["is_loading"]),

    breadcrumbs: function() {
      if (this.formB) {
        let b = [{ text: "Signing Authorities Home", to: "/dashboard" }];
        b.push({
          text: `${this.formB.employee.name}`,
          to: `/employee/${this.formB.employee.ynet_id}`,
        });
        b.push({
          text: `${this.formB.program_branch} / ${this.formB.employee.title}`,
        });
        return b;
      }

      return [];
    },

    isLocked() {
      return this.formB.department_reviews && this.formB.department_reviews.length > 0;
    },
    isActive() {
      return this.formB.finance_reviews && this.formB.finance_reviews.length > 0;
    },

    stepperValue() {
      if (this.formB.finance_reviews) return 6;
      if (this.formB.upload_signatures) return 4;
      if (this.formB.department_reviews) return 3;

      return 2;
    },
    canDelete() {
      return true;
    },
    canDownload() {
      if (this.formB.department_reviews) return true;
      return false;
    },

    canEdit() {
      if (this.formB.department_reviews) return false;
      return true;
    },
    canLock() {
      if (this.formB.department_reviews) return false;
      return true;
    },
    canUnlock() {
      if (this.formB.department_reviews && !this.formB.finance_reviews) return true;
      return false;
    },
    canUpload() {
      if (this.formB.department_reviews && !this.formB.upload_signatures) return true;
      return false;
    },
    canApprove() {
      return this.formB.upload_signatures && !this.formB.finance_reviews;
    },
    canDuplicate() {
      return false;
    },
    canArchive() {
      return false;
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

    createDate() {
      return "On " + moment(this.formB.create_date).format("MMM D, YYYY @ h:mm a");
    },
    createName() {
      return "By " + this.formB.created_by;
    },

    lockDate() {
      if (this.formB.department_reviews) {
        return "On " + moment(this.formB.department_reviews[0].date).format("MMM D, YYYY @ h:mm a");
      }
      return "";
    },
    lockName() {
      if (this.formB.department_reviews) {
        return "By " + this.formB.department_reviews[0].name;
      }
      return "";
    },

    uploadDate() {
      if (this.formB.upload_signatures) {
        return "On " + moment(this.formB.upload_signatures.date).format("MMM D, YYYY @ h:mm a");
      }
      return "";
    },
    uploadName() {
      if (this.formB.upload_signatures) {
        return "By " + this.formB.upload_signatures.name;
      }
      return "";
    },
    uploadIsValid() {
      if (this.formB.supervisor_signed && this.formB.employee_signed && this.formB.file) return true;
      return false;
    },

    financeApproveDate() {
      if (this.formB.finance_approval_complete) {
        return "Approved " + moment(this.formB.finance_approval_complete.date).format("MMM D, YYYY @ h:mm a");
      } else if (this.formB.finance_approval_reject) {
        return "Rejected " + moment(this.formB.finance_approval_reject.date).format("MMM D, YYYY @ h:mm a");
      }
      return "";
    },
    financeApproveName() {
      if (this.formB.finance_approval_complete) {
        return "By " + this.formB.finance_approval_complete.name;
      } else if (this.formB.finance_approval_reject) {
        return "By " + this.formB.finance_approval_reject.name;
      }
      return "";
    },
    pdfURL: function() {
      return `${AUTHORITY_URL}/${this.formB._id}/pdf`;
    },
  },
  async mounted() {
    this.id = this.$route.params.formBId;
    this.loadFormB(this.id);
    this.page.title = "Form B Details";
  },
  methods: {
    ...mapActions("authority/formB", ["loadFormB", "deleteFormB", "saveFormB", "saveFormBWithFile"]),

    openFormA() {
      if (this.formB && this.formB.form_a && this.formB.form_a.activation)
        this.$refs.pdfPreview.show(
          "Signed Form A",
          `${AUTHORITY_URL}/uploads/${this.formB.form_a.activation.file_id}/file`
        );
      else console.log("No form attached");
    },

    editFormB() {
      this.$router.push(`/form-b/${this.id}/edit`);
    },

    deleteClick() {
      this.deleteFormB({
        id: this.id,
      }).then(() => {
        this.$router.push(`/departments/${this.formB.department_code}`);
      });
    },

    duplicateClick() {},
    generateClick() {
      this.formB.save_action = "Lock";

      this.saveFormB(this.formB).then(() => {
        this.loadFormB(this.id);
      });
    },
    uploadClick() {},
    archiveClick() {},

    unlockClick() {
      this.formB.save_action = "Reset";

      this.saveFormB(this.formB).then(() => {
        this.loadFormB(this.id);
      });
    },

    async downloadPDF() {
      if (this.formB.upload_signatures) {
        window.open(`${AUTHORITY_URL}/uploads/${this.formB.upload_signatures.file_id}/file`);
      } else {
        window.open(this.pdfURL);
      }
    },

    showPreview() {
      if (this.formB.upload_signatures) {
        this.$refs.pdfPreview.show(
          "Signed Form B",
          `${AUTHORITY_URL}/uploads/${this.formB.upload_signatures.file_id}/file`
        );
      } else {
        this.$refs.pdfPreview.show("Form B Preview", this.pdfURL);
      }
    },

    startUploadReview() {
      this.showUploadDialog = true;
    },
    async uploadSigned() {
      this.formB.save_action = "UploadSignatures";

      this.saveFormBWithFile(this.formB).then(() => {
        this.loadFormB(this.id);
        this.showUploadDialog = false;
      });
    },

    startFinanceApprove() {
      this.showFinanceApproveDialog = true;
    },

    async financeApproveApprove() {
      this.formB.save_action = "FinanceApproveApprove";

      this.saveFormB(this.formB).then(() => {
        this.loadFormB(this.id);
        this.showFinanceApproveDialog = false;
      });
    },

    async financeApproveReject() {
      this.formB.save_action = "FinanceApproveReject";

      this.saveFormB(this.formB).then(() => {
        this.loadFormB(this.id);
        this.showFinanceApproveDialog = false;
      });
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
  height: 140px;
  white-space: nowrap;
  vertical-align: bottom;
  padding-bottom: 20px;
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
