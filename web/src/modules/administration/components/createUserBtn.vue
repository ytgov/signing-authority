<template>
  <div>
    <v-dialog v-model="show" persistent width="800">
      <template v-slot:activator="{ on, attrs }">
        <v-btn color="primary" small v-bind="attrs" v-on="on" @click="doShow">Add User</v-btn>
      </template>

      <v-app-bar dark color="#0097A9">
        <v-toolbar-title>
          Add User
        </v-toolbar-title>
        <v-spacer />
        <v-icon title="Close" @click="show = false">mdi-close</v-icon>
      </v-app-bar>
      <v-card tile>
        <v-card-text class="mt-5 pb-0">
          <employee-lookup
            actionName="Select"
            label="Employee : "
            :select="pickEmployee"
            v-if="!selectedEmployee.email"
          ></employee-lookup>

          <v-text-field
            v-model="selectedEmployee.display_name"
            readonly
            dense
            outlined
            label="Name"
            append-icon="mdi-lock"
            v-if="selectedEmployee.email"
            append-outer-icon="mdi-close-circle"
            @click:append-outer="unselectEmployee"
          ></v-text-field>
          <div v-if="selectedEmployee.email">
            <v-text-field
              v-model="selectedEmployee.email"
              label="Email"
              dense
              outlined
              readonly
              append-icon="mdi-lock"
            ></v-text-field>
            <v-select
              label="Status"
              v-model="selectedEmployee.status"
              dense
              outlined
              :items="['Active', 'Inactive']"
            ></v-select>
            <v-select
              label="Role"
              multiple
              clearable
              dense
              outlined
              v-model="roles"
              required
              :items="roleOptions"
            ></v-select>

            <v-autocomplete
              v-if="isDepartmentAdmin"
              label="Department"
              dense
              outlined
              multiple
              v-model="selectedEmployee.department_admin_for"
              :items="departmentList"
              item-text="display_name"
              item-value="dept"
              clearable
            ></v-autocomplete>
          </div>

          <div>
            <v-btn @click="doCreate" color="primary" class="float-left" :disabled="!isValid">Add</v-btn>
            <v-btn @click="show = false" color="secondary" class="float-right">Close</v-btn>
          </div>
          <div style="clear: both"></div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import EmployeeLookup from "@/modules/employee/components/employeeLookup.vue";

export default {
  name: "CreateUserBtn",
  props: ["onSave"],
  components: { EmployeeLookup },
  data: () => ({
    roleOptions: [
      "Employee",
      "System Admin",
      "Department of Finance",
      "Form A Administrator",
      "Form B Administrator",
      "Acting Appointment Administrator",
    ],
    item: {},
    show: false,

    isEmployeeLoading: false,
    employeeItems: [],
    employeeSearch: "",
    employeeId: "",
    selectedEmployee: {},
    roles: [],
  }),
  computed: {
    isDepartmentAdmin: function() {
      if (this.roles) {
        return (
          this.roles.includes("Form A Administrator") ||
          this.roles.includes("Form B Administrator") ||
          this.roles.includes("Acting Appointment Administrator")
        );
      }
      return false;
    },
    ...mapGetters("department", ["departmentList"]),

    isValid() {
      if (this.selectedEmployee.email && this.selectedEmployee.title.length > 0) return true;

      return false;
    },
  },
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
    roles: function() {
      this.selectedEmployee.roles = this.roles;
    },
  },

  mounted: async function() {},
  methods: {
    ...mapActions("employee", ["searchEmployees"]),
    ...mapActions("administration", ["createUser"]),

    async doShow() {
      this.selectedEmployee = {};
    },
    async doCreate() {
      if (!this.selectedEmployee.roles || this.selectedEmployee.roles.length == 0)
        this.selectedEmployee.roles = ["Employee"];

      let resp = await this.createUser(this.selectedEmployee);
      this.$emit("update");
      this.show = false;
      this.onSave(resp);
    },
    pickEmployee(item) {
      this.selectedEmployee = item;
      this.roles = ["Employee"];
      this.selectedEmployee.status = "Active";
    },
    unselectEmployee() {
      this.selectedEmployee = {};
    },
  },
};
</script>
