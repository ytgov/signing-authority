<template>
  <v-dialog persistent v-model="showDialog" width="600">
    <v-app-bar dark color="#0097A9">
      <v-toolbar-title>Edit User</v-toolbar-title>
      <v-spacer />
      <v-icon title="Close" @click="showDialog = false">mdi-close</v-icon> </v-app-bar
    ><v-card tile>
      <v-card-text class="mt-5 pb-0">
        <v-text-field
          v-model="item.display_name"
          label="Name"
          dense
          outlined
          readonly
          append-icon="mdi-lock"
        ></v-text-field>
        <v-text-field v-model="item.email" label="Email" dense outlined readonly append-icon="mdi-lock"></v-text-field>
        <v-select label="Status" v-model="item.status" dense outlined :items="['Active', 'Inactive']"></v-select>
        <v-select
          label="Role"
          dense
          outlined
          v-model="item.roles"
          :items="roleOptions"
          multiple
          clearable
          placeholder="Employee"
        ></v-select>
        <v-autocomplete
          v-if="isDepartmentAdmin"
          label="Department"
          dense
          outlined
          multiple
          v-model="item.department_admin_for"
          :items="departmentList"
          item-text="display_name"
          item-value="dept"
          clearable
        ></v-autocomplete>
        <div class="d-flex">
          <v-btn @click="save" color="primary" class="mt-0">Save</v-btn>
          <v-spacer></v-spacer>
          <v-btn v-if="item.sub" @click="unlink" color="secondary" small class="mt-0 ">Unlink Auth</v-btn>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapActions, mapGetters, mapState } from "vuex";

export default {
  name: "UserEdtior",
  props: ["onSave"],
  data: () => ({
    showDialog: false,
    item: {},
  }),
  computed: {
    ...mapState("administration", ["roleOptions"]),
    isDepartmentAdmin: function() {
      if (this.item.roles) {
        return (
          this.item.roles.includes("Form A Administrator") ||
          this.item.roles.includes("Form B Administrator") ||
          this.item.roles.includes("Acting Appointment Administrator") ||
          this.item.roles.includes("Form Viewer")
        );
      }
      return false;
    },
    ...mapGetters("department", ["departmentList"]),
  },
  methods: {
    ...mapActions("administration", ["saveUser", "unlinkUser"]),
    show(item) {
      this.item = item;
      this.showDialog = true;
    },
    async save() {
      let resp = await this.saveUser(this.item);
      this.onSave(resp);
      this.showDialog = false;
    },
    async unlink() {
      let resp = await this.unlinkUser(this.item);
      this.onSave(resp);
      this.showDialog = false;
    },
  },
};
</script>
