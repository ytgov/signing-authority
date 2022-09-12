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
        >
        </actions-menu>
      </template>

      <v-overlay absolute :value="loading">
        <v-progress-circular indeterminate size="64"></v-progress-circular
      ></v-overlay>

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

// import uploadFormModal from "../components/uploadFormModal.vue"
// import AuthorityMetadataCard from "../components/authorityMetadataCard.vue";

export default {
  name: "AuthorityDetails",
  components: {
    formATable,
    ActionsMenu,
    FormAStatus,
    PdfPreviewDialog,
    // uploadFormModal,
    // AuthorityMetadataCard,
  },
  data: () => ({
    loading: false,
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
    department: {},
    authority: {},
    showUpload: false,
  }),
  computed: {
    ...mapState("department", ["departments"]),
    ...mapState("authority/formA", ["formA"]),
    ...mapGetters("authority/formA", ["isActive", "isLocked", "status"]),
    activationDate() {
      if (this.formA.activation) return moment(this.formA.activation.date).format("MMM D, YYYY @ h:mm a");
      return "";
    },
  },
  async mounted() {
    this.loading = true;
    this.id = this.$route.params.id;
    let departmentId = this.$route.params.departmentId;
    this.department = await this.getDepartment({ id: departmentId });

    this.breadcrumbs[1].text = this.department.descr;
    this.breadcrumbs[1].to = `/departments/${departmentId}`;
    this.breadcrumbs[2].to = `/departments/${departmentId}/positions`;

    let formA = await this.loadFormA({ id: this.$route.params.formAId });
    this.page.title = `${formA.program_branch}: ${formA.position}`;
    this.breadcrumbs[3].text = this.page.title;
    this.loading = false;
  },
  methods: {
    ...mapActions("department", ["getDepartment"]),
    ...mapActions("authority/formA", ["loadFormA"]),
    // editClick() {
    //   //TODO: this should check the state to determine if changes are allowed
    //   this.$router.push(`/positions/${this.formA.id}/edit`);
    // },
    // async generateClick() {
    //   window.open(`${AUTHORITY_URL}/${this.id}/pdf`, "_blank");
    //   //await this.downloadFormB(this.id);
    // },
    // uploadClick() {
    //   this.showUpload = true; //show modal fup upload
    // },
    // archiveClick() {},
    // downloadClick() {},

    openFormB(item) {
      this.$router.push(`/form-b/${item._id}`);
    },
    showPreview() {
      this.$refs.pdfPreview.show("Signed Form A", `${AUTHORITY_URL}/uploads/${this.formA.activation.file_id}/file`);
    },
  },
};
</script>
