<template>
  <v-container fluid class="down-top-padding">
    <BaseBreadcrumb :title="page.title" :icon="page.icon" :breadcrumbs="breadcrumbs"> </BaseBreadcrumb>

    <BaseCard :showHeader="true" heading="Delegation of Financial Signing Authority">
      <template slot="right">
        <v-chip color="#f2a900" v-if="formA.is_deputy_minister" class="mr-4" dark>Deputy Minister or Equivalent</v-chip>
        <form-a-status :isLocked="isLocked" :status="status"> </form-a-status>

        <actions-menu :showPreview="showPreview"> </actions-menu>
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
    ...mapActions("authority/formA", ["loadFormA"]),

    openFormB(item) {
      this.$router.push(`/form-b/${item._id}`);
    },
    showPreview() {
      this.$refs.pdfPreview.show("Signed Form A", `${AUTHORITY_URL}/uploads/${this.formA.activation.file_id}/file`);
    },
  },
};
</script>
