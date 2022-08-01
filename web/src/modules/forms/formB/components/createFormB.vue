<template>
  <div>
    <v-dialog v-model="show" persistent width="800">
      <template v-slot:activator="{ on, attrs }">
        <v-btn color="primary" small v-bind="attrs" v-on="on" @click="doShow"
          >Add</v-btn
        >
      </template>

      <v-app-bar dark color="#0097A9">
        <v-toolbar-title>
          Add Form B for {{ department.descr }}
        </v-toolbar-title>
        <v-spacer />
        <v-icon title="Close" @click="show = false">mdi-close</v-icon>
      </v-app-bar>
      <v-card tile>
        <v-card-text class="mt-5 pb-0">
          <directory-search-add></directory-search-add>

          <v-autocomplete
            label="Supervisor"
            dense
            outlined
            hide-no-data
            hide-selected
            :items="supervisorItems"
            item-text="display_name"
            item-value="_id"
            :loading="isSupervisorLoading"
            :search-input.sync="supervisorSearch"
            v-model="supervisorId"
          ></v-autocomplete>
          <v-autocomplete
            :items="formAItems"
            item-text="display_name"
            item-value="_id"
            label="Form A Position"
            dense
            outlined
            v-model="formAId"
            return-object
          ></v-autocomplete>
          <v-text-field
            label="Position Title"
            dense
            outlined
            v-model="position"
          ></v-text-field>

          <div>
            <v-btn @click="doCreate" color="primary" class="float-left"
              >Add</v-btn
            >
            <v-btn @click="show = false" color="secondary" class="float-right"
              >Close</v-btn
            >
          </div>
          <div style="clear: both"></div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapActions } from "vuex";
import DirectorySearchAdd from "@/modules/employee/components/directorySearchAdd";

export default {
  name: "CreateFormB",
  props: { department: Object },
  components: { DirectorySearchAdd },
  data: () => ({
    show: false,
    formAItems: [],

    isEmployeeLoading: false,
    employeeItems: [],
    employeeSearch: "",

    isSupervisorLoading: false,
    supervisorItems: [],
    supervisorSearch: "",

    employeeId: "",
    supervisorId: "",
    formAId: "",
    position: "",
  }),
  computed: {},
  watch: {
    employeeSearch(val) {
      // Items have already been loaded
      if (val && val.length == 0) return;
      //if (this.employeeItems && this.employeeItems.length > 0) return;

      // Items have already been requested
      if (this.isEmployeeLoading) return;

      this.isEmployeeLoading = true;

      // Lazily load input items
      this.searchEmployees({ terms: val })
        .then((res) => {
          this.employeeItems = res;
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => (this.isEmployeeLoading = false));
    },
    supervisorSearch(val) {
      // Items have already been loaded
      if (!val || val.length == 0) return;
      //if (this.supervisorItems && this.supervisorItems.length > 0) return;

      // Items have already been requested
      if (this.isSupervisorLoading) return;

      this.isSupervisorLoading = true;

      // Lazily load input items
      this.searchEmployees({ terms: val })
        .then((res) => {
          this.supervisorItems = res;
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => (this.isSupervisorLoading = false));
    },
  },

  mounted: async function () {},
  methods: {
    ...mapActions("department", ["getAll", "getFormAList"]),
    ...mapActions("employee", ["searchEmployees"]),
    ...mapActions("forms/formB", ["createFormB"]),
    async doShow() {
      this.employeeId = "";
      this.supervisorId = "";
      this.formAId = "";
      this.position = "";

      let formAItems = await this.getFormAList({ id: this.department.dept });
      this.formAItems = formAItems.map((i) => {
        return Object.assign(i, {
          display_name: `${i.program_branch} / ${i.position}`,
        });
      });
    },
    async doCreate() {
      await this.createFormB({
        department_code: this.formAId.department_code,
        department_descr: this.formAId.department_descr,
        employee_id: this.employeeId,
        supervisor_id: this.supervisorId,
        program_branch: this.formAId.program_branch,
        formAId: this.formAId._id,
        title: this.position,
        authority_lines: this.formAId.authority_lines,
      });

      this.show = false;
    },
  },
};
</script>