<template>
  <div class="float-right">
      <v-menu offset-y>
        <template v-slot:activator="{ on, attrs }">
          <v-btn color="secondary" small v-bind="attrs" v-on="on" class="mt-2">
            Actions <v-icon>mdi-chevron-down</v-icon>
          </v-btn>
        </template>
        <v-list dense>
          <v-list-item
            v-if="!formA.reviewed_by_department"
            @click="editClick">
            <v-list-item-title>Edit
            </v-list-item-title>
          </v-list-item>

          <v-list-item @click="generateClick">
            <v-list-item-title>Lock for Signatures</v-list-item-title>
          </v-list-item>

          <v-list-item @click="uploadClick">
            <!-- <upload-form-modal></upload-form-modal> -->
            <v-list-item-title>Upload Signed PDF</v-list-item-title>
          </v-list-item>

          <v-list-item @click="archiveClick">
            <v-list-item-title>Archive</v-list-item-title>
          </v-list-item>

          <v-list-item @click="archiveClick">
            <v-list-item-title>Duplicate</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
  </div>
</template>
<script>
export default {
  name: 'actionsMenu',
  props: {
    formA: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      //
    };
  },
  methods: {
    editClick() {
      this.$router.push(`/form-a/${this.formA._id}/edit`);
    },
    generateClick() {
      this.$router.push({
        name: 'FormAGenerate',
        params: { id: this.formA._id },
      });
    },
    uploadClick() {
      this.$router.push({
        name: 'FormAUpload',
        params: { id: this.formA._id },
      });
    },
    archiveClick() {
      this.$router.push({
        name: 'FormAArchive',
        params: { id: this.formA._id },
      });
    },
    duplicateClick() {
      this.$router.push({
        name: 'FormADuplicate',
        params: { id: this.formA._id },
      });
    },
  },
};

</script>
