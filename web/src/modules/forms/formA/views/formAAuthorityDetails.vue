
<template>
  <v-container fluid class="down-top-padding">
    <BaseBreadcrumb
      :title="page.title"
      :icon="page.icon"
      :breadcrumbs="breadcrumbs"
    >
    </BaseBreadcrumb>

    <BaseCard
      showHeader="false"
      :heading="`Delegation of Financial Signing Authority - FORM A`"
    >
      <template v-slot:right>
        <!-- <timed-message ref="messager" class="mr-4"></timed-message> -->
        <form-a-status
          :isLocked="isLocked"
          :isActive="isActive"> </form-a-status>
        <actions-menu :formA="formA"> </actions-menu>
      </template>

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
              <v-data-table :headers="[{ text: 'Name' }]" />
            </v-card-text> </v-card
        ></v-col>
        <v-col cols="7">
          <v-card class="default">
            <v-card-title>Audit History</v-card-title>
            <v-card-text>
              <v-data-table
                :headers="[
                  { text: 'Date' },
                  { text: 'Person' },
                  { text: 'Revision' },
                ]"
              />
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </BaseCard>
  </v-container>
</template>

<script>
// import { AUTHORITY_URL} from "@/urls"
import { mapActions, mapState, mapGetters } from "vuex";
import formATable from "../components/formATable.vue";
import ActionsMenu from "../components/actionsMenu.vue";
import FormAStatus from '../components/formAStatus/formAStatus.vue';

// import uploadFormModal from "../components/uploadFormModal.vue"
// import AuthorityMetadataCard from "../components/authorityMetadataCard.vue";

export default {
  name: "AuthorityDetails",
  components: {
    formATable,
    ActionsMenu,
    FormAStatus,
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
        text: "Form A Authorizations",
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
    ...mapGetters("authority/formA", ["isActive", "isLocked"])
  },
  async mounted() {
    this.id = this.$route.params.id;
    let departmentId = this.$route.params.departmentId;
    this.department = await this.getDepartment({ id: departmentId });

    this.breadcrumbs[1].text = this.department.descr;
    this.breadcrumbs[1].to = `/departments/${departmentId}`;
    this.breadcrumbs[2].to = `/departments/${departmentId}/form-a`;

    // this.breadcrumbs[4].text = "Positions";
    //this.page.title = this.department.descr;
    let formA = await this.loadFormA({ id: this.$route.params.formAId });

    this.page.title = `${formA.program_branch}: ${formA.position}`;
    this.breadcrumbs[3].text = this.page.title;
  },
  methods: {
    ...mapActions("department", ["getDepartment"]),
    // ...mapActions("authority/formB", ["loadFormB", "downloadFormB"]),
    ...mapActions("authority/formA", ["loadFormA"]),
    // editClick() {
    //   //TODO: this should check the state to determine if changes are allowed
    //   this.$router.push(`/form-a/${this.formA.id}/edit`);
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
  },
};
</script>
