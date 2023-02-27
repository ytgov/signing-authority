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
            <small class="mt-1" v-if="stepperValue > 4">Ready to be activated</small>
          </v-stepper-step>
        </v-stepper-header>
      </v-stepper>

      <v-card class="default">
        <div style="float: right; margin-right: 15px; margin-top: 15px">
          <form-b-status
            :isLocked="isLocked"
            :isActive="isActive"
            :isCancelled="formB.cancel_date ? true : false"
            :authorityType="formB.authority_type"
          >
          </form-b-status>

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

              <v-list-item @click="startActivate" v-if="canSchedule && formB.authority_type == 'acting'">
                <v-list-item-title>Acting Appointment</v-list-item-title>
              </v-list-item>

              <v-list-item @click="startActivate" v-if="canSchedule && formB.authority_type == 'temporary'">
                <v-list-item-title>Schedule Activation</v-list-item-title>
              </v-list-item>

              <v-list-item @click="startActivate" v-if="canActivate">
                <v-list-item-title>Activate</v-list-item-title>
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

              <v-list-item color="warning" @click="deleteClick" v-if="canDelete">
                <v-list-item-title>
                  Delete
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>

        <v-card-title
          >Form B for
          <router-link :to="`/employee/${formB.employee.ynet_id}`" class="ml-1">{{
            formB.employee.name
          }}</router-link></v-card-title
        >

        <v-card-subtitle>
          Department: <strong>{{ formB.department_descr }}</strong>
        </v-card-subtitle>

        <v-card-text>
          <form-b-table></form-b-table>
        </v-card-text>
      </v-card>

      <v-row class="mt-3">
        <v-col cols="6">
          <!--  <authority-supervisor-card :formB="formB" class="mb-5" />
 -->

          <v-card class="default mb-5">
            <v-card-title>History</v-card-title>
            <v-card-text class="pb-0">
              <div v-if="formB.activation && formB.activation.length > 0">
                <v-alert
                  v-for="(act, idx) of formB.activation"
                  :key="idx"
                  text
                  dense
                  outlined
                  style="border-color: #9e9e9e !important"
                >
                  <v-row>
                    <v-col cols="10" :class="act.current_status == 'Active' ? 'green--text' : 'warning--text'">
                      <strong>Current status:</strong> {{ act.current_status }}<br />

                      <span v-if="!act.approve_user_date && !act.reject_user_date">
                        <strong>Awaiting approval from:</strong> {{ act.approve_user_email }} <br />
                      </span>
                      <span v-else-if="act.reject_user_date">
                        <strong>Rejected by: </strong>{{ act.approve_user_email }} <br />
                        <strong>Rejected on: </strong>{{ act.reject_user_date }} <br />
                      </span>
                      <span v-else-if="act.approve_user_date">
                        <strong>Approved by:</strong> {{ act.approve_user_email }} <br />
                        <strong>Approved on:</strong> {{ formatDate(act.approve_user_date) }}
                        <br />
                      </span>

                      <strong>Effective:</strong> {{ act.date }}
                      <span v-if="act.expire_date"> to {{ act.expire_date }}</span>
                      <span v-else> until cancelled</span>
                    </v-col>
                    <v-col>
                      <v-btn
                        v-if="
                          canEditActivations && (act.current_status == 'Active' || act.current_status == 'Scheduled')
                        "
                        small
                        class="my-0 float-right"
                        color="secondary"
                        @click="startEditActivation(idx)"
                        >Edit</v-btn
                      >
                    </v-col>
                  </v-row>

                  <div v-if="canShowSupervisor(act)">
                    <v-btn @click="doSupervisorApprove(act)" color="primary" class="mb-0 mr-5">Approve</v-btn>
                    <v-btn @click="doSupervisorReject(act)" color="warning" class="mb-0 mr-5">Reject</v-btn>
                  </div>
                </v-alert>
              </div>
              <div v-else class="mb-4">
                This Form B has never been activated.
              </div>
            </v-card-text>
          </v-card>

          <v-card class="default">
            <v-card-title>Related Position</v-card-title>
            <v-card-text>
              <v-text-field
                v-model="formAProgram"
                label="Program"
                dense
                outlined
                background-color="white"
                readonly
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

              <v-row>
                <v-col>
                  <v-btn color="primary" small class="my-0" @click="openFormA" v-if="canPreviewFormA"
                    >Preview Signed Form A</v-btn
                  >
                </v-col>
                <v-spacer />
                <v-col style="text-align: right">
                  <router-link :to="`/departments/${formB.department_code}/positions/${formB.form_a_id}`"
                    >Show Position</router-link
                  >
                </v-col>
              </v-row>
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
        <v-toolbar-title v-if="formB.authority_type == 'acting'">Create Acting Appointment</v-toolbar-title>
        <v-toolbar-title v-else>Schedule Activation</v-toolbar-title>
        <v-spacer />
        <v-icon title="Close" @click="showActivateDialog = false">mdi-close</v-icon>
      </v-app-bar>
      <v-card tile>
        <v-card-text class="pt-3">
          <v-row>
            <v-col cols="12">
              <div v-if="formB.authority_type == 'substantive'">
                <p v-if="formB.status.indexOf('Suspended') >= 0">
                  A suspended Form B can be re-activated by setting an effective date. To activate this Form B
                  immediately, set the Effective date as today.
                </p>
                <p v-else>
                  A Substantive Form B is active until cancelled which is done by viewing the activation history and
                  clicking the 'Edit' button.
                </p>
              </div>
              <div v-if="formB.authority_type == 'temporary'">
                <p>
                  A temporary From B must be scheduled to be activated. The effective date can be today or in the
                  future. A temporary Form B will become active on the effective date and archived on the expiration
                  date.
                </p>
                <p>
                  An activation can be removed, extended or expired early by viewing the activation history and clicking
                  the 'Edit' button.
                </p>
              </div>
              <div v-if="formB.authority_type == 'acting'">
                <p>
                  Acting appointments can be created multiple times. An acting appointment can be extended or expired
                  early by viewing the acting history and clicking the 'Edit' button.
                </p>
              </div>
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
                v-if="formB.authority_type != 'substantive'"
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
                v-if="!activateEmployee.email && formB.authority_type == 'acting'"
              ></employee-lookup>

              <v-text-field
                v-model="activateEmployee.display_name"
                readonly
                dense
                outlined
                label="Supervisor to approve Acting Appointment"
                append-icon="mdi-lock"
                v-if="activateEmployee.email && formB.authority_type == 'acting'"
                append-outer-icon="mdi-close-circle"
                @click:append-outer="unselectEmployee"
              ></v-text-field>
            </v-col>
          </v-row>

          <v-btn @click="doScheduleActivate" color="primary" class="mb-0 mr-5" :disabled="!activateValid"
            >Schedule</v-btn
          >

          <v-btn @click="showActivateDialog = false" color="secondary" class="mb-0">Cancel</v-btn>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showCancelDialog" persistent width="700">
      <v-app-bar dark color="#0097A9">
        <v-toolbar-title>Cancel Form B</v-toolbar-title>
        <v-spacer />
        <v-icon title="Close" @click="showCancelDialog = false">mdi-close</v-icon>
      </v-app-bar>
      <v-card tile>
        <v-card-text class="pt-3">
          <p>
            A cancelled Form B cannot be re-activated and any current or future activations will be expired as of today.
          </p>

          <p>This action cannot be undone. Click 'Cancel' to proceed.</p>

          <v-btn @click="doCancel" color="primary" class="mb-0 mr-5">Cancel</v-btn>
          <v-btn @click="showCancelDialog = false" color="secondary" class="mb-0">Close</v-btn>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showActivationEditDialog" persistent width="600">
      <v-app-bar dark color="#0097A9">
        <v-toolbar-title>Edit Activation</v-toolbar-title>
        <v-spacer />
        <v-icon title="Close" @click="showActivationEditDialog = false">mdi-close</v-icon>
      </v-app-bar>
      <v-card tile>
        <v-card-text class="pt-3">
          <div v-if="editActivation.current_status == 'Scheduled'">
            <p>
              Since this activation is currently 'Scheduled' for the future, you can change the dates or remove it
              entirely.
            </p>

            <v-row>
              <v-col cols="6">
                <v-menu
                  v-model="startDateMenu1"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  left
                  nudge-top="26"
                  offset-y
                  min-width="auto"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-model="editActivation.date"
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
                    v-model="editActivation.date"
                    @input="startDateMenu1 = false"
                    @change="startDate1Changed"
                    :min="today"
                  ></v-date-picker>
                </v-menu>
              </v-col>
              <v-col cols="6">
                <v-menu
                  v-model="endDateMenu2"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  left
                  nudge-top="26"
                  offset-y
                  min-width="auto"
                  v-if="formB.authority_type != 'substantive'"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-model="editActivation.expire_date"
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
                    v-model="editActivation.expire_date"
                    @input="endDateMenu2 = false"
                    :min="activateEffective"
                  ></v-date-picker>
                </v-menu>
              </v-col>
            </v-row>

            <v-btn
              @click="doActivationEditSave"
              color="primary"
              class="mb-0 mr-5"
              :disabled="!(editActivation.date && editActivation.expire_date)"
              >Save</v-btn
            >
            <v-btn @click="doActivationEditRemove" color="warning" class="mb-0 mr-5">Remove</v-btn>
            <v-btn @click="showActivationEditDialog = false" color="secondary" class="mb-0">Close</v-btn>
          </div>

          <div v-if="editActivation.current_status == 'Active'">
            <p>
              Since this activation is currently 'Active', you can only change the Expiration date. To expire this
              activation immediately, set the Expiration date to yesterday's date (<a
                @click="editActivation.expire_date = yesterday"
                >{{ yesterday }}</a
              >).
            </p>

            <v-text-field
              dense
              outlined
              v-model="editActivation.date"
              label="Effective date"
              readonly
              append-icon="mdi-lock"
            ></v-text-field>

            <v-menu
              v-model="endDateMenu1"
              :close-on-content-click="false"
              transition="scale-transition"
              left
              nudge-top="26"
              offset-y
              min-width="auto"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  v-model="editActivation.expire_date"
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
                v-model="editActivation.expire_date"
                @input="endDateMenu1 = false"
                :min="yesterday"
              ></v-date-picker>
            </v-menu>

            <v-btn @click="doActivationEditSave" color="primary" class="mb-0 mr-5">Save</v-btn>
            <v-btn @click="showActivationEditDialog = false" color="secondary" class="mb-0">Close</v-btn>
          </div>
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
import FormBStatus from "../components/status/formBStatus.vue";
import FormBTable from "../components/formBTable.vue";

export default {
  name: "AuthorityDetails",
  components: {
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
    showCancelDialog: false,
    showSupervisorDialog: false,
    showActivationEditDialog: false,

    activateMethod: "Substantive Position",
    activateEffective: null,
    activateExpiry: null,
    startDateMenu: null,
    startDateMenu1: null,
    endDateMenu: null,
    endDateMenu1: null,
    endDateMenu2: null,
    activateEmployee: {},
    today: moment().format("YYYY-MM-DD"),
    yesterday: moment()
      .subtract(1, "day")
      .format("YYYY-MM-DD"),
    editActivation: {},
    editActivationIndex: -1,

    editActivationHasStarted: true,
  }),
  computed: {
    ...mapGetters("authority/formB", ["formB"]),
    ...mapState("authority/formB", ["is_loading"]),
    ...mapState("home", ["profile"]),

    userIsSysAdmin() {
      return this.profile && this.profile.roles && this.profile.roles.includes("System Admin");
    },
    userIsDeptAdmin() {
      return (
        this.profile &&
        this.profile.roles &&
        this.profile.roles.includes("Form B Administrator") &&
        this.profile.department_admin_for.includes(this.formB.department_code)
      );
    },
    userIsFinanceAdmin() {
      return this.profile && this.profile.roles && this.profile.roles.includes("Department of Finance");
    },
    userIsActingAdmin() {
      return (
        this.profile &&
        this.profile.roles &&
        this.profile.roles.includes("Acting Appointment Administrator") &&
        this.profile.department_admin_for.includes(this.formB.department_code)
      );
    },

    stepperValue() {
      if (this.formB.finance_reviews) return 5;
      if (this.formB.upload_signatures) return 4;
      if (this.formB.department_reviews && this.formB.department_reviews.length > 0) return 3;
      return 2;
    },

    isLocked() {
      return this.stepperValue >= 3;
    },
    isCancelled() {
      return this.formB.cancel_date ? true : false;
    },
    isApproved() {
      return this.stepperValue >= 5;
    },
    isActive() {
      let result = false;

      if (this.formB.activation && this.formB.activation.length > 0) {
        for (let act of this.formB.activation) if (act.current_status == "Active") return true;
      }

      return result;
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

    canDelete() {
      return (this.userIsDeptAdmin || this.userIsSysAdmin) && !this.isApproved && !this.isCancelled;
    },
    canDownload() {
      return this.isLocked || this.isCancelled;
    },
    canPreviewFormA() {
      return this.userIsDeptAdmin || this.userIsSysAdmin || this.userIsFinanceAdmin || this.userIsSysAdmin;
    },
    canEdit() {
      return (this.userIsDeptAdmin || this.userIsSysAdmin) && !this.isLocked && !this.isCancelled;
    },
    canEditActivations() {
      if (this.isCancelled || !this.isApproved) return false;
      if (this.formB.authority_type == "acting") {
        return this.userIsActingAdmin || this.userIsSysAdmin;
      } else {
        return this.userIsDeptAdmin || this.userIsSysAdmin;
      }
    },
    canLock() {
      return (this.userIsDeptAdmin || this.userIsSysAdmin) && !this.isLocked && !this.isCancelled;
    },
    canUnlock() {
      return (this.userIsDeptAdmin || this.userIsSysAdmin) && this.isLocked && !this.isApproved && !this.isCancelled;
    },
    canUpload() {
      return (
        (this.userIsDeptAdmin || this.userIsSysAdmin) && this.isLocked && !this.isCancelled && this.stepperValue == 3
      );
    },
    canApprove() {
      return (this.userIsFinanceAdmin || this.userIsSysAdmin) && this.stepperValue == 4 && !this.isCancelled;
    },

    canActivate() {
      if (this.isActive && this.formB.authority_type == "substantive") return false;

      return (
        (this.userIsDeptAdmin || this.userIsSysAdmin) &&
        this.isApproved &&
        !this.isCancelled &&
        this.formB.authority_type == "substantive"
      );
    },

    canSchedule() {
      if (this.isCancelled) return false;
      if (this.isActive && this.formB.authority_type == "substantive") return false;

      if (this.isApproved && this.formB.authority_type == "acting") {
        if (this.userIsSysAdmin || this.userIsActingAdmin) return true;
        return false;
      } else if (this.isApproved && this.formB.authority_type != "substantive") return true;
      return false;
    },
    canCancel() {
      return (this.userIsDeptAdmin || this.userIsSysAdmin) && !this.isCancelled && this.isApproved;
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
      if (this.formB.authority_type == "substantive" && this.activateEffective) return true;
      else if (this.formB.authority_type == "acting") {
        if (this.activateEffective && this.activateExpiry && this.activateEmployee.email) {
          if (this.activateEmployee.email != this.formB.employee.email) return true;
        }
      } else if (this.formB.authority_type == "temporary" && this.activateEffective && this.activateExpiry) return true;
      return false;
    },
    formAProgram() {
      return this.formB.form_a.program_branch + (this.formB.form_a.activity ? `: ${this.formB.form_a.activity}` : "");
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
      "cancelFormB",
    ]),
    formatDate(input) {
      return moment(input).format("YYYY-MM-DD");
    },

    openFormA() {
      if (
        (this.userIsActingAdmin || this.userIsDeptAdmin || this.userIsFinanceAdmin || this.userIsSysAdmin) &&
        this.formB &&
        this.formB.form_a &&
        this.formB.form_a.activation
      ) {
        this.$refs.pdfPreview.show(
          "Signed Form A",
          `${AUTHORITY_URL}/uploads/${this.formB.form_a.activation.file_id}/file`
        );
      } else console.log("No form attached");
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

    generateClick() {
      this.formB.save_action = "Lock";

      this.saveFormB(this.formB).then(() => {
        this.loadFormB(this.id);
      });
    },
    uploadClick() {},

    unlockClick() {
      this.formB.save_action = "Reset";

      this.saveFormB(this.formB).then(() => {
        this.loadFormB(this.id);
      });
    },

    async downloadPDF() {
      if (
        (this.userIsActingAdmin || this.userIsDeptAdmin || this.userIsFinanceAdmin || this.userIsSysAdmin) &&
        this.formB.upload_signatures
      ) {
        window.open(`${AUTHORITY_URL}/uploads/${this.formB.upload_signatures.file_id}/file`);
      } else {
        window.open(this.pdfURL);
      }
    },

    showPreview() {
      if (
        (this.userIsActingAdmin || this.userIsDeptAdmin || this.userIsFinanceAdmin || this.userIsSysAdmin) &&
        this.formB.upload_signatures
      ) {
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
      this.activateMethod = this.formB.authority_type;
      this.activateEffective = null;
      this.activateExpiry = null;
      this.activateEmployee = {};
      this.showActivateDialog = true;
    },
    startCancel() {
      this.showCancelDialog = true;
    },
    startDateChanged() {
      if (this.activateExpiry) this.activateExpiry = null;
    },
    startDate1Changed() {
      if (this.editActivation.expire_date) this.editActivation.expire_date = null;
    },
    doScheduleActivate() {
      let body = {
        date: this.activateEffective,
        expire_date: this.formB.authority_type == "substantive" ? null : this.activateExpiry,
        activate_reason: this.formB.authority_type,
        approve_user_email: this.formB.authority_type != "acting" ? this.profile.email : this.activateEmployee.email,
        approve_user_date: this.formB.authority_type == "acting" ? null : new Date(),
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

    doCancel() {
      this.cancelFormB(this.formB).then(() => {
        this.loadFormB(this.id);
        this.showCancelDialog = false;
      });
    },

    canShowSupervisor(activation) {
      if (
        !this.isCancelled &&
        this.isApproved &&
        this.formB.authority_type == "acting" &&
        !activation.approve_user_date &&
        !activation.reject_user_date
      ) {
        if (activation.approve_user_email && this.profile && this.profile.email) {
          if (activation.approve_user_email.toLowerCase() == this.profile.email.toLowerCase()) {
            return true;
          }
        }
      }

      return false;
    },

    doSupervisorApprove(activation) {
      this.formB.activation.forEach((act) => {
        if (
          act.activate_reason == activation.activate_reason &&
          act.date == activation.date &&
          act.approve_user_email == activation.approve_user_email
        )
          act.approve_user_date = new Date();
      });

      this.formB.save_action = "SupervisorApproveActing";

      this.saveFormB(this.formB).then(() => {
        this.loadFormB(this.id);
      });
    },
    doSupervisorReject(activation) {
      this.formB.activation.forEach((act) => {
        if (
          act.activate_reason == activation.activate_reason &&
          act.date == activation.date &&
          act.approve_user_email == activation.approve_user_email
        )
          act.reject_user_date = new Date();
      });

      this.formB.save_action = "SupervisorRejectActing";

      this.saveFormB(this.formB).then(() => {
        this.loadFormB(this.id);
      });
    },
    startEditActivation(index) {
      this.editActivationIndex = index;
      this.editActivation = this.formB.activation[this.editActivationIndex];
      this.showActivationEditDialog = true;
    },
    doActivationEditSave() {
      this.formB.save_action = "ActivationChange";
      this.formB.activation[this.editActivationIndex] = this.editActivation;

      this.saveFormB(this.formB).then(() => {
        this.loadFormB(this.id);
        this.showActivationEditDialog = false;
      });
    },
    doActivationEditRemove() {
      this.formB.save_action = "ActivationRemove";
      this.formB.activation.splice(this.editActivationIndex, 1);

      this.saveFormB(this.formB).then(() => {
        this.loadFormB(this.id);
        this.showActivationEditDialog = false;
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
