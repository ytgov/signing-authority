<template>
  <v-container fluid class="down-top-padding">
    <BaseBreadcrumb
      :title="page.title"
      :icon="page.icon"
      :breadcrumbs="breadcrumbs"
    >
      <template v-slot:right>
        <!-- <timed-message ref="messager" class="mr-4"></timed-message> -->
      </template>
    </BaseBreadcrumb>

    <BaseCard showHeader="true">
      <template v-slot:left>
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Search"
          single-line
          hide-details
        ></v-text-field>
      </template>
      <template v-slot:right> </template>

      <v-row>
        <v-col>
          <department-form-a-list
            :search="search" />
        </v-col>
        <v-col>
          <!-- <department-form-b-list
            :search="search" /> -->
        </v-col>
      </v-row>
    </BaseCard>
  </v-container>
</template>


<script>
import { mapActions, mapState } from "vuex";
import departmentFormAList from '../components/departmentFormAList';
// import departmentFormBList from '../components/departmentFormBList';

export default {
  components: {
    departmentFormAList,
    // departmentFormBList
     },
  name: "DepartmentDetail",
  data: () => ({
    search: "",
    drawer: null,
    searchResults: [],
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
        disabled: true,
      },
    ],


    item: {},
    loadingFormB: true,

    selectedId: null,
  }),
  mounted: async function () {
    this.selectedId = this.$route.params.id;
    this.loadList()
    // this.loadList();
  },
  computed: {
    ...mapState("department", ["departments"]),


  },
  methods: {
    ...mapActions("department", [
      "getDepartment",

    ]),

    // openDepartment(item) {
    //   this.$router.push(`/departments/${item.dept}`);
    // },
    async loadList() {
      this.item = await this.getDepartment({ id: this.selectedId });
      if (this.item && this.item.dept) {
        this.breadcrumbs[2].text = this.item.descr;
        this.page.title = this.item.descr;
        // this.loadFormA();
        // this.loadFormB();
      }
    },
    // async loadFormA() {

    // },
    // async loadFormB() {
    //   this.formBItems = await this.getFormBList({ id: this.selectedId });
    //   this.loadingFormB = false;
    // },
    // openFormA(item) {
    //   this.$router.push(`${this.formALink}/${item._id}`)
    // },
    // openFormB(item) {
    //   this.$router.push(`/employee/${item._id}/form-b/${item._id}`)
    // },
  },
};
</script>
