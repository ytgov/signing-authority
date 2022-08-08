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

    <BaseCard :showHeader="true">
      <template v-slot:left>
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Search"
          single-line
          hide-details
        ></v-text-field>
      </template>
      <template v-slot:right>
        <create-form-b :department="item"></create-form-b>
      </template>

      <department-form-b-list :search="search"> </department-form-b-list>
    </BaseCard>
  </v-container>
</template>

<script>
import { mapActions } from "vuex";
import departmentFormBList from "../components/departmentFormBList.vue";
import createFormB from "@/modules/forms/formB/components/createFormB.vue";

export default {
  components: { departmentFormBList, createFormB },
  name: "DepartmentDetail",
  data: () => ({
    search: "",
    drawer: null,
    searchResults: [],
    loading: false,
    page: {
      title: "Form B Authorizations",
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
        text: "Form B Authorizations",
        disabled: true,
      },
    ],
    item: {},
    departmentId: "",
  }),
  mounted: async function () {
    this.departmentId = this.$route.params.departmentId;
    this.item = await this.getDepartment({ id: this.departmentId });

    this.breadcrumbs[1].to = `/departments/${this.departmentId}`;
    this.breadcrumbs[1].text = this.item.descr;
  },
  computed: {},
  methods: {
    ...mapActions("department", ["getDepartment"]),
  },
};
</script>
