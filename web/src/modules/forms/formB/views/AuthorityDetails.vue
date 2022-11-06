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

          <v-stepper-step step="5" :complete="stepperValue > 5">
            Approved
            <small class="mt-1">Ready to be activated</small>
          </v-stepper-step>
          <v-divider></v-divider>

          <v-stepper-step step="6" :complete="stepperValue > 6"> Complete </v-stepper-step>
        </v-stepper-header>
      </v-stepper>

      <v-card class="default">
        <div style="float: right; margin-right: 15px; margin-top: 15px">
          <form-b-status :isLocked="isLocked" :isActive="isActive"> </form-b-status>

          <v-menu offset-y left v-if="canAdminister">
            <template v-slot:activator="{ on, attrs }">
              <v-btn color="secondary" small v-bind="attrs" v-on="on" class="mt-2">
                Actions <v-icon>mdi-chevron-down</v-icon>
              </v-btn>
            </template>
            <v-list dense>
              <v-list-item @click="editFormB" v-if="canEdit">
                <v-list-item-title>Edit</v-list-item-title>
              </v-list-item>

              <v-list-item @click="startActivate" v-if="canActivate">
                <v-list-item-title>Schedule Activation</v-list-item-title>
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

              <v-list-item @click="unlockClick" v-if="canUnlock">
                <v-list-item-title>Unlock and Rewind</v-list-item-title>
              </v-list-item>

              <v-list-item @click="startFinanceApprove" v-if="canApprove">
                <v-list-item-title>Finance Approve</v-list-item-title>
              </v-list-item>

              <v-list-item @click="startCancel" v-if="canCancel">
                <v-list-item-title>Cancel Form B</v-list-item-title>
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
        <v-toolbar-title>Upload Signed Form B for {{ formB.employee.name }}</v-toolbar-title>
        <v-spacer />
        <v-icon title="Close" @click="showUploadDialog = false">mdi-close</v-icon>
      </v-app-bar>
      <v-card tile>
        <v-card-text class="pt-3">
          <p>Please ensure both the Supervisor and Employee have signed the form.</p>
          <v-checkbox
            label="Supervisor signed"
            dense
            outlined
            hide-details
            v-model="formB.supervisor_signed"
          ></v-checkbox>

          <v-checkbox label="Employee signed" dense outlined v-model="formB.employee_signed"></v-checkbox>
          <v-file-input
            dense
            outlined
            accept="application/pdf"
            label="Signed Form B"
            v-model="formB.file"
          ></v-file-input>

          <p>Department of Finance Admins will receive an email notification that this Form B is ready for review.</p>
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
            By clicking the 'Approve' button below, you are verifying that you have reviewed the uploaded Form B.
            Clicking 'Approve' will activate the Form B.
          </p>
          <p>
            If the Form B has errors, provide detail in the dialogue box below for the department to rectify the errors,
            then click 'Reject'.
          </p>

          <p>Departmental finance admins will receive an email notification when you complete this step.</p>

          <v-textarea rows="3" dense outlined label="Comments" hide-details v-model="formB.comments"></v-textarea>

          <v-btn @click="financeApproveApprove" color="primary" class="mb-0 mr-5">Approve</v-btn>
          <v-btn @click="financeApproveReject" color="error" class="mb-0" :disabled="!formB.comments">Reject</v-btn>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showActivateDialog" persistent width="700">
      <v-app-bar dark color="#0097A9">
        <v-toolbar-title>Schedule Activation</v-toolbar-title>
        <v-spacer />
        <v-icon title="Close" @click="showActivateDialog = false">mdi-close</v-icon>
      </v-app-bar>
      <v-card tile>
        <v-card-text class="pt-3">
          <h3 class="mb-3">Activation History</h3>

          <div v-if="formB.activation && formB.activation.length > 0">
            <v-alert v-for="(act, idx) of formB.activation" :key="idx" color="success" text dense>
              <v-row>
                <v-col cols="10">
                  <strong>Status:</strong> Active<br />
                  <strong>Type:</strong> {{ act.activate_reason }}<br />

                  <strong>Effective</strong> {{ act.date }}
                  <span v-if="act.expire_date"> to {{ act.expire_date }}</span>
                  <span v-else> until cancelled</span>
                </v-col>
                <v-col>
                  <v-btn small class="my-0 float-right" color="secondary">Edit</v-btn>
                </v-col>
              </v-row>
            </v-alert>
          </div>
          <div v-else>
            <p class="text-warning">This Form B has never been activated</p>
          </div>

          <h3 class="mt-5">Schedule New Activation</h3>
          <v-row>
            <v-col cols="12">
              <v-select
                label="Activate for"
                dense
                outlined
                hide-details
                v-model="activateMethod"
                :items="['Substantive Position', 'Temporary', 'Acting Appointment']"
              ></v-select>
            </v-col>
            <v-col cols="6">
              <v-menu
                v-model="startDateMenu"
                :close-on-content-click="false"
                transition="scale-transition"
                left
                nudge-top="26"
                offset-y
                min-width="auto"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    v-model="activateEffective"
                    label="Effective date"
                    append-icon="mdi-calendar"
                    readonly
                    outlined
                    hide-details
                    dense
                    background-color="white"
                    v-bind="attrs"
                    v-on="on"
                  ></v-text-field>
                </template>
                <v-date-picker
                  v-model="activateEffective"
                  @input="startDateMenu = false"
                  @change="startDateChanged"
                  :min="today"
                ></v-date-picker>
              </v-menu>
            </v-col>
            <v-col cols="6">
              <v-menu
                v-model="endDateMenu"
                :close-on-content-click="false"
                transition="scale-transition"
                left
                nudge-top="26"
                offset-y
                min-width="auto"
                v-if="activateMethod != 'Substantive Position'"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    v-model="activateExpiry"
                    label="Expiration date"
                    append-icon="mdi-calendar"
                    readonly
                    outlined
                    hide-details
                    dense
                    background-color="white"
                    v-bind="attrs"
                    v-on="on"
                  ></v-text-field>
                </template>
                <v-date-picker
                  v-model="activateExpiry"
                  @input="endDateMenu = false"
                  :min="activateEffective"
                ></v-date-picker>
              </v-menu>
            </v-col>

            <v-col cols="12">
              <employee-lookup
                actionName="Select"
                label="Supervisor to approve Acting Appointment : "
                :select="pickEmployee"
                v-if="!activateEmployee.email && activateMethod == 'Acting Appointment'"
              ></employee-lookup>

              <v-text-field
                v-model="activateEmployee.display_name"
                readonly
                dense
                outlined
                label="Employee"
                append-icon="mdi-lock"
                v-if="activateEmployee.email && activateMethod == 'Acting Appointment'"
                append-outer-icon="mdi-close-circle"
                @click:append-outer="unselectEmployee"
              ></v-text-field>
            </v-col>
          </v-row>

          <v-btn @click="doScheduleActivate" color="primary" class="mb-0" :disabled="!activateValid">Schedule</v-btn>
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
import EmployeeLookup from "@/modules/employee/components/employeeLookup.vue";

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
    EmployeeLookup,
  },
  data: () => ({
    id: "",
    authority: {},
    showUpload: false,
    page: { title: "" },

    showUploadDialog: false,
    showFinanceApproveDialog: false,
    showActivateDialog: false,

    activateMethod: "Substantive Position",
    activateEffective: null,
    activateExpiry: null,
    startDateMenu: null,
    endDateMenu: null,
    activateEmployee: {},
    today: moment().format("YYYY-MM-DD"),
  }),
  computed: {
    ...mapGetters("authority/formB", ["formB"]),
    ...mapState("authority/formB", ["is_loading"]),
    ...mapState("home", ["profile"]),

    canAdminister() {
      if (this.profile && this.profile.roles && this.profile.roles.length > 0) {
        if (this.profile.roles.includes("System Admin")) return true;

        if (
          this.profile.roles.includes("Department Admin") &&
          this.profile.department_admin_for.includes(this.departmentId)
        )
          return true;
      }

      return false;
    },

    breadcrumbs: function() {
      if (this.formB) {
        let b = [{ text: "Signing Authorities Home", to: "/dashboard" }];

        b.push({
          text: `${this.formB.department_descr}`,
          to: `/departments/${this.formB.department_code}`,
        });
        b.push({
          text: `Form B Authorizations`,
          to: `/departments/${this.formB.department_code}/form-b`,
        });

        /*  b.push({
          text: `${this.formB.employee.name}`,
          to: `/employee/${this.formB.employee.ynet_id}`,
        }); */
        b.push({
          text: ` ${this.formB.employee.title} (${this.formB.employee.name})`,
        });
        return b;
      }

      return [];
    },

    isLocked() {
      return this.formB.department_reviews && this.formB.department_reviews.length > 0;
    },
    isActive() {
      // this needs more work
      return this.formB.activation && this.formB.activation.length > 0;
    },

    stepperValue() {
      if (this.formB.finance_reviews) return 5;
      if (this.formB.upload_signatures) return 4;
      if (this.formB.department_reviews) return 3;

      return 2;
    },
    canDelete() {
      return !this.isActive;
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
      if (this.formB.department_reviews && !this.formB.finance_reviews) {
        if (this.profile.roles.includes("System Admin")) return true;
        if (this.profile.roles.includes("Department Admin")) return true;
      }
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
    canActivate() {
      if (this.formB.finance_reviews) return true;
      return false;
    },
    canCancel() {
      if (this.formB.finance_reviews) return true;
      return false;
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
      if (this.formB.finance_reviews) {
        return "Approved " + moment(this.formB.finance_reviews[0].date).format("MMM D, YYYY @ h:mm a");
      } else if (this.formB.finance_reviews) {
        return "Rejected " + moment(this.formB.finance_approval_reject.date).format("MMM D, YYYY @ h:mm a");
      }
      return "";
    },
    financeApproveName() {
      if (this.formB.finance_reviews) {
        return "By " + this.formB.finance_reviews[0].name;
      } else if (this.formB.finance_approval_reject) {
        return "By " + this.formB.finance_approval_reject.name;
      }
      return "";
    },
    pdfURL: function() {
      return `${AUTHORITY_URL}/${this.formB._id}/pdf`;
    },

    activateValid() {
      //let today = new Date();

      if (this.activateMethod == "Substantive Position" && this.activateEffective) return true;
      else if (this.activateMethod == "Acting Appointment")
        return this.activateEffective && this.activateExpiry && this.activateEmployee.email;
      else if (this.activateMethod == "Temporary" && this.activateEffective && this.activateExpiry) return true;
      return false;
    },
  },
  async mounted() {
    this.id = this.$route.params.formBId;
    this.loadFormB(this.id);
    this.page.title = "Form B Details";
  },
  methods: {
    ...mapActions("authority/formB", [
      "loadFormB",
      "deleteFormB",
      "saveFormB",
      "saveFormBWithFile",
      "scheduleActivation",
    ]),

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
    startActivate() {
      this.activateMethod = "Substantive Position";
      this.activateEffective = moment().format("YYYY-MM-DD");
      this.activateExpiry = null;
      this.activateEmployee = {};
      this.showActivateDialog = true;
    },
    startCancel() {
      console.log("START CANCEL");
    },
    startDateChanged() {
      if (this.activateExpiry) this.activateExpiry = null;
    },
    doScheduleActivate() {
      let body = {
        date: this.activateEffective,
        expire_date: this.activateMethod == "Substantive Position" ? null : this.activateExpiry,
        activate_reason: this.activateMethod,
        approve_user_email: this.activateEmployee.email,
        approve_user_date: this.activateMethod == "Acting Appointment" ? null : new Date(),
      };

      this.scheduleActivation({ id: this.formB._id, body }).then(() => {
        this.loadFormB(this.id);
        this.showActivateDialog = false;
      });
    },
    unselectEmployee() {
      this.activateEmployee = {};
    },
    pickEmployee(item) {
      this.activateEmployee = item;
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
