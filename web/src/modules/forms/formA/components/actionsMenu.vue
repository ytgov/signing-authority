<template>
  <div>
    <v-menu offset-y>
      <template v-slot:activator="{ on, attrs }">
        <v-btn color="secondary" small v-bind="attrs" v-on="on" class="mt-3">
          Actions <v-icon>mdi-chevron-down</v-icon>
        </v-btn>
      </template>
      <v-list dense>
        <v-list-item v-if="!isLocked" @click="editClick">
          <v-list-item-title>Edit </v-list-item-title>
        </v-list-item>

        <v-list-item v-if="formA.is_deputy_minister && !isLocked" @click="dmStartApprove">
          <v-list-item-title>DM - Lock for Approval</v-list-item-title>
        </v-list-item>

        <v-list-item v-if="formA.is_deputy_minister && isLocked && !isActive" @click="dmApprove">
          <v-list-item-title>DM - Approve</v-list-item-title>
        </v-list-item>

        <v-list-item v-if="formA.activation && !formA.is_deputy_minister" @click="preview">
          <v-list-item-title>View Form A</v-list-item-title>
        </v-list-item>
        <!--    <v-list-item @click="generateClick">
          <v-list-item-title>Lock for Signatures</v-list-item-title>
        </v-list-item>
 -->
        <!-- <v-list-item @click="uploadClick">
          <-- <upload-form-modal></upload-form-modal> ->
          <v-list-item-title>Upload Signed PDF</v-list-item-title>
        </v-list-item> -->
        <v-list-item v-if="formA.status == 'Active'">
          <archive-form-a :position="formA"> </archive-form-a>
          <!-- <v-list-item-title>Archive</v-list-item-title> -->
        </v-list-item>

        <v-list-item @click="duplicateClick">
          <v-list-item-title>Duplicate</v-list-item-title>
        </v-list-item>
        <v-list-item @click="deleteClick" v-if="!isActive && !isLocked">
          <v-list-item-title>Delete</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>
<script>
import { mapActions } from "vuex";
import archiveFormA from "./actions/archiveFormA.vue";
export default {
  components: { archiveFormA },
  name: "actionsMenu",
  props: {
    formA: {
      type: Object,
      required: true,
    },
    isActive: {
      type: Boolean,
      required: false,
      default: false,
    },
    isLocked: {
      type: Boolean,
      required: false,
      default: false,
    },
    status: { type: String },
    showPreview: { type: Function },
  },
  data() {
    return {
      //
    };
  },
  methods: {
    ...mapActions("authority/formA", ["duplicateFormA", "deleteFormA", "saveFormA"]),
    editClick() {
      this.$router.push(`/departments/${this.formA.department_code}/positions/${this.formA._id}/edit`);
    },
    generateClick() {
      this.$router.push({
        name: "FormAGenerate",
        params: { id: this.formA._id },
      });
    },
    uploadClick() {
      this.$router.push({
        name: "FormAUpload",
        params: { id: this.formA._id },
      });
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
    dmStartApprove() {
      this.formA.save_action = "DMLock";

      this.saveFormA(this.formA);
    },
    dmApprove() {
      this.formA.save_action = "DMApprove";

      this.saveFormA(this.formA);
    },
  },
};
</script>
