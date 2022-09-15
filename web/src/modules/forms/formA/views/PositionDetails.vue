<template>
  <v-container fluid class="down-top-padding">
    <BaseBreadcrumb :title="page.title" :icon="page.icon" :breadcrumbs="breadcrumbs"> </BaseBreadcrumb>

    <BaseCard :showHeader="true" heading="Delegation of Financial Signing Authority">
      <template slot="right">
        <!-- <timed-message ref="messager" class="mr-4"></timed-message> -->
        <form-a-status :isLocked="isLocked" :isActive="isActive" :status="status"> </form-a-status>

        <actions-menu
          :formA="formA"
          :isLocked="isLocked"
          :isActive="isActive"
          :status="status"
          :showPreview="showPreview"
          v-if="canAdminister"
        >
        </actions-menu>
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
                ]"
                :items="formA.active_authorities"
                @click:row="openFormB"
                class="row-clickable"
              />
            </v-card-text>
          </v-card>

          <v-card class="default mt-5" v-if="formA.activation">
            <v-card-title>Activation Details</v-card-title>
            <v-card-text>
              <v-text-field
                label="Recommender"
                v-model="formA.activation.recommender_name"
                dense
                outlined
                readonly
                append-icon="mdi-lock"
                background-color="white"
              ></v-text-field>
              <v-text-field
                label="Approver"
                v-model="formA.activation.approver_name"
                dense
                outlined
                readonly
                append-icon="mdi-lock"
                background-color="white"
              ></v-text-field>
              <v-text-field
                label="Date"
                v-model="activationDate"
                dense
                outlined
                readonly
                append-icon="mdi-lock"
                background-color="white"
              ></v-text-field>

              <v-btn small color="primary" class="my-0" @click="showPreview">View Form A</v-btn>
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
  }),
  computed: {
    ...mapState("department", ["departments"]),
    ...mapState("authority/formA", ["formA", "is_loading"]),
    ...mapGetters("authority/formA", ["isActive", "isLocked", "status"]),
    ...mapState("home", ["profile"]),

    activationDate() {
      if (this.formA.activation) return moment(this.formA.activation.date).format("MMM D, YYYY @ h:mm a");
      return "";
    },

    canAdminister() {
      if (this.profile && this.profile.roles.length > 0) {
        if (this.profile.roles.includes("System Admin")) return true;

        if (
          this.profile.roles.includes("Department Admin") &&
          this.profile.department_admin_for.includes(this.departmentId)
        )
          return true;
      }

      return false;
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
    this.page.title = `${formA.program_branch}: ${formA.position}`;
    this.breadcrumbs[3].text = this.page.title;
  },
  methods: {
    ...mapActions("department", ["getDepartment"]),
    ...mapActions("authority/formA", ["loadFormA"]),

    openFormB(item) {
      this.$router.push(`/form-b/${item._id}`);
    },
    showPreview() {
      console.log("SHOW CALLED", this.formA);
      this.$refs.pdfPreview.show("Signed Form A", `${AUTHORITY_URL}/uploads/${this.formA.activation.file_id}/file`);
    },
  },
};
</script>
