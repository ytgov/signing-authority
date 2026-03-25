<template>
  <div>
    <v-dialog persistent v-model="showDialog" width="600">
      <v-app-bar dark color="#0097A9">
        <v-toolbar-title>Edit User</v-toolbar-title>
        <v-spacer />
        <v-icon title="Close" @click="showDialog = false">mdi-close</v-icon> </v-app-bar><v-card tile>
        <v-card-text class="mt-5 pb-0">
          <v-text-field v-model="item.display_name" label="Name" dense outlined readonly
            append-icon="mdi-lock"></v-text-field>
          <v-text-field v-model="item.email" label="Email" dense outlined></v-text-field>
          <v-select label="Status" v-model="item.status" dense outlined :items="['Active', 'Inactive']"></v-select>
          <v-select label="Role" dense outlined v-model="item.roles" :items="roleOptions" multiple clearable
            placeholder="Employee"></v-select>
          <v-autocomplete v-if="isDepartmentAdmin" label="Department" dense outlined multiple
            v-model="item.department_admin_for" :items="departmentList" item-text="display_name" item-value="dept"
            clearable></v-autocomplete>
          <div class="d-flex">
            <v-btn @click="save" color="primary" class="mt-0">Save</v-btn>
            <v-spacer></v-spacer>
            <v-btn v-if="item.sub" @click="unlink" color="secondary" small class="mt-0 ">Unlink Auth</v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showConfirmEmail" max-width="500" persistent>
      <v-card>
        <v-card-title>Confirm Email Change</v-card-title>
        <v-card-text>
          Changing a user's email address is a dangerous operation and could potentially give the user
          access to take actions they shouldn't. Please verify that another user does not have the same address prior to
          making the change. <br /><br />Would you like to continue?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="warning" text @click="cancelEmailChange">Cancel</v-btn>
          <v-btn color="primary" @click="confirmEmailChange">Continue</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from "vuex";

export default {
  name: "UserEdtior",
  props: ["onSave"],
  data: () => ({
    showDialog: false,
    showConfirmEmail: false,
    item: {},
    originalEmail: "",
  }),
  computed: {
    ...mapState("administration", ["roleOptions"]),
    isDepartmentAdmin: function () {
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
      this.originalEmail = item.email;
      this.showDialog = true;
    },
    async save() {
      if (this.item.email !== this.originalEmail) {
        this.showConfirmEmail = true;
        return;
      }
      await this.doSave();
    },
    cancelEmailChange() {
      this.showConfirmEmail = false;
    },
    async confirmEmailChange() {
      this.showConfirmEmail = false;
      await this.doSave();
    },
    async doSave() {
      let resp = await this.saveUser({ ...this.item, originalEmail: this.originalEmail });
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
