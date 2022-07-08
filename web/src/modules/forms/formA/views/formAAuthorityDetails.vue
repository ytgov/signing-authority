
<template>
  <v-container fluid class="down-top-padding">
    <!-- <BaseBreadcrumb
      :title="page.title"
      :icon="page.icon"
      :breadcrumbs="breadcrumbs"
    >
      <template v-slot:right> -->
        <!-- <timed-message ref="messager" class="mr-4"></timed-message> -->
      <!-- </template>
    </BaseBreadcrumb> -->
    <v-row>
      <v-col>
        <h1>Delegation of Financial Signing Authority - FORM A</h1>
      </v-col>
      <v-col>
        <actions-menu :formA="formA"> </actions-menu>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-card class="default">
          <v-card-text>
            <formATable :formA="formA"></formATable>

            <!--   <v-data-table style="font-size: .5rem !important"
            dense
            :headers="[{text:'Account', value:'account'}, {text: 'S23 Goods', value:'s24_procure_goods_limit'}]"
            :items="formB.authority_lines"></v-data-table>

-->
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <!-- <v-btn
              :to="{
                name: 'DepartmentDetail',
                params: { id: formA.department.id },
              }"
              color="#7A9A01"
              >Close</v-btn
            > -->
            <v-btn
              @click="$router.push(`/departments/${formA.department_code}`);"
              color="#7A9A01"
              >Close</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>




<script>
import { AUTHORITY_URL} from "@/urls"
import { mapActions, mapState } from "vuex";
import formATable from "../components/formATable.vue";
import ActionsMenu from '../components/actionsMenu.vue';

// import uploadFormModal from "../components/uploadFormModal.vue"
// import AuthorityMetadataCard from "../components/authorityMetadataCard.vue";

export default {
  name: "AuthorityDetails",
  components: {
    formATable,
    ActionsMenu,
    // uploadFormModal,
    // AuthorityMetadataCard,
  },
  data: () => ({
    // id: "62b7dc1177a03a5a69223007",
    loading: false,
    page: {
      title: "Departments",
    },
    breadcrumbs: [
      {
        text: "Signing Authorities Home",
        to: "/dashboard",
      },
      {
        text: "Departments",
        to: "/departments",
        exact: true,
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
    // formA: {
    //   department: {
    //     name: "Finance",
    //     id: "12",
    //   },
    //   program: "Taxation",
    //   authority_lines: [
    //     {
    //       position: "Deputy Minister",
    //       account: "12",
    //       s24_procure_goods_limit: "100",
    //       s24_procure_services_limit: "250",
    //       s23_procure_goods_limit: "NL",
    //       s23_procure_services_limit: "100",
    //       s30_payment_limit: "NL",
    //       s29_performance_limit: "NL",
    //     },
    //     {
    //       position: "ADM, Finance and Admin",
    //       account: "12x-10",
    //       s24_procure_goods_limit: "50",
    //       s24_procure_services_limit: "250",
    //       s23_procure_goods_limit: "100",
    //       s23_procure_services_limit: "100",
    //       s30_payment_limit: "NL",
    //       s29_performance_limit: "NL",
    //     },
    //     {
    //       position: "",
    //       account: "12x-50",
    //       s24_procure_goods_limit: "50",
    //       s24_procure_services_limit: "250",
    //       s23_procure_goods_limit: "100",
    //       s23_procure_services_limit: "100",
    //       s30_payment_limit: "NL",
    //       s29_performance_limit: "NL",
    //     },
    //     {
    //       position: "ADM, Special Projects",
    //       account: "12x-15",
    //       s24_procure_goods_limit: "50",
    //       s24_procure_services_limit: "250",
    //       s23_procure_goods_limit: "100",
    //       s23_procure_services_limit: "100",
    //       s30_payment_limit: "NL",
    //       s29_performance_limit: "NL",
    //     },
    //   ],
    // },


  }),
  computed: {
    ...mapState("department", ["departments"]),
    ...mapState("authority/formA", ["formA"]),
    // ...mapGetters("authority/formB", ["formB"]),
  },
  async mounted() {
    // this.loadFormB(this.$route.params.id);
    this.id = this.$route.params.id;
    // let departmentId = this.$route.params.departmentId;
    // this.department = await this.getDepartment({ id: departmentId });

    // this.breadcrumbs[2].text = this.department.descr;
    // this.breadcrumbs[2].to = `/departments/${departmentId}`;
    // this.breadcrumbs[3].to = `/departments/${departmentId}/form-a`;

    // this.breadcrumbs[4].text = "Positions";
    //this.page.title = this.department.descr;
    this.loadFormA(this.$route.params.id)
  },
  methods: {
    ...mapActions("department", ["getDepartment"]),
    // ...mapActions("authority/formB", ["loadFormB", "downloadFormB"]),
    ...mapActions("authority/formA", [
      "loadFormA",
    ]),
    editClick() {
      //TODO: this should check the state to determine if changes are allowed
      this.$router.push(`/form-a/${this.formA.id}/edit`);
    },
    async generateClick() {
      window.open(`${AUTHORITY_URL}/${this.id}/pdf`, "_blank");
      //await this.downloadFormB(this.id);
    },
    uploadClick() {
      this.showUpload = true; //show modal fup upload
    },
    archiveClick() {},
    downloadClick() {},
  },
};
</script>
