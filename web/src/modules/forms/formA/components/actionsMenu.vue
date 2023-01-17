<template>
  <div v-if="canEdit || canDMLock || canDMApprove || canPreview || canArchive || canDuplicate || canDelete">
    <v-menu offset-y>
      <template v-slot:activator="{ on, attrs }">
        <v-btn color="secondary" small v-bind="attrs" v-on="on" class="mt-3">
          Actions <v-icon>mdi-chevron-down</v-icon>
        </v-btn>
      </template>
      <v-list dense>
        <v-list-item v-if="canEdit" @click="editClick">
          <v-list-item-title>Edit </v-list-item-title>
        </v-list-item>

        <v-list-item v-if="canDMLock" @click="dmLock">
          <v-list-item-title>DM - Lock for Approval</v-list-item-title>
        </v-list-item>

        <v-list-item v-if="canDMApprove" @click="startDMApprove">
          <v-list-item-title>DM - Approve</v-list-item-title>
        </v-list-item>

        <v-list-item v-if="canPreview" @click="preview">
          <v-list-item-title>View Form A</v-list-item-title>
        </v-list-item>

        <v-list-item v-if="canArchive">
          <archive-form-a :position="formA"> </archive-form-a>
        </v-list-item>

        <v-list-item v-if="canDuplicate" @click="duplicateClick">
          <v-list-item-title>Duplicate</v-list-item-title>
        </v-list-item>

        <v-list-item @click="deleteClick" v-if="canDelete">
          <v-list-item-title>Delete</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>
<script>
import { mapActions, mapState } from "vuex";
import archiveFormA from "./actions/archiveFormA.vue";
export default {
  components: { archiveFormA },
  name: "actionsMenu",
  props: {
    showPreview: { type: Function },
    showDMApprove: { type: Function },
  },
  computed: {
    ...mapState("authority/formA", ["formA"]),
    ...mapState("home", ["profile"]),
    isActive() {
      return this.formA.status == "Active";
    },
    isArchived() {
      return this.formA.deactivation != undefined;
    },
    isLocked() {
      return (
        this.formA.activation != undefined ||
        this.formA.deactivation != undefined ||
        this.formA.position_group_id != undefined
      );
    },

    userIsSysAdmin() {
      return this.profile && this.profile.roles && this.profile.roles.includes("System Admin");
    },
    userIsDeptAdmin() {
      return (
        this.profile &&
        this.profile.roles &&
        this.profile.roles.includes("Form A Administrator") &&
        this.profile.department_admin_for.includes(this.formA.department_code)
      );
    },
    userIsFinanceAdmin() {
      return this.profile && this.profile.roles && this.profile.roles.includes("Department of Finance");
    },

    canEdit() {
      if (this.isLocked || this.isArchived) return false;
      if (this.userIsSysAdmin || this.userIsDeptAdmin) return true;

      return false;
    },
    canDuplicate() {
      return this.userIsSysAdmin || this.userIsDeptAdmin;
    },
    canPreview() {
      return this.formA.activation && !this.formA.is_deputy_minister;
    },
    canArchive() {
      if (this.formA.is_deputy_minister) return false;
      return (this.userIsSysAdmin || this.userIsDeptAdmin) && this.formA.status == "Active";
    },
    canDelete() {
      if (this.formA.is_deputy_minister) return false;
      if (this.isActive || this.isLocked || this.isArchived) return false;
      if (this.userIsSysAdmin || this.userIsDeptAdmin) return true;

      return false;
    },

    canDMLock() {
      return (
        (this.formA.is_deputy_minister || this.formA.is_deputy_duplicate) &&
        !this.isLocked &&
        (this.userIsDeptAdmin || this.userIsSysAdmin)
      );
    },
    canDMApprove() {
      return (
        (this.formA.is_deputy_minister || this.formA.is_deputy_duplicate) &&
        this.isLocked &&
        !this.isActive &&
        (this.userIsFinanceAdmin || this.userIsSysAdmin)
      );
    },
  },
  methods: {
    ...mapActions("authority/formA", ["duplicateFormA", "deleteFormA", "saveFormA"]),
    editClick() {
      this.$router.push(`/departments/${this.formA.department_code}/positions/${this.formA._id}/edit`);
    },
    async duplicateClick() {
      let duplicate = await this.duplicateFormA();
      this.$router.push(`/departments/${this.formA.department_code}/positions/${duplicate._id}/edit`);
    },
    async deleteClick() {
      let response = await this.deleteFormA(this.formA._id);

      if (response.status == 200) {
        this.$router.push(`/departments/${this.formA.department_code}/positions`);
      }
    },
    preview() {
      this.showPreview();
    },
    async dmLock() {
      this.formA.save_action = "DMLock";

      await this.saveFormA(this.formA);
    },

    startDMApprove() {
      this.showDMApprove();
    },
  },
};
</script>
