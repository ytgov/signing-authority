<template>
  <v-dialog persistent v-model="showDialog" width="600">
    <v-app-bar dark color="#0097A9">
      <v-toolbar-title>Edit Operational Restriction</v-toolbar-title>
      <v-spacer />
      <v-icon title="Close" @click="showDialog = false">mdi-close</v-icon> </v-app-bar
    ><v-card tile>
      <v-card-text class="mt-5 pb-0">
        <v-text-field v-model="item.description" label="Description" dense outlined></v-text-field>
        <v-text-field type="number" v-model="item.sort" label="Sort order" dense outlined></v-text-field>
        <v-checkbox v-model="item.is_active" label="Active" dense outlined></v-checkbox>

        <div>
          <v-btn @click="save" color="primary" class="mt-0">Save</v-btn>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapActions } from "vuex";

export default {
  name: "UserEdtior",
  props: ["onSave"],
  data: () => ({
    showDialog: false,
    item: {},
  }),
  computed: {},
  methods: {
    ...mapActions("administration", ["createOperationalRestriction", "updateOperationalRestriction"]),

    show(item) {
      this.item = item;
      this.showDialog = true;
    },
    async save() {
      if (this.item._id) {
        let resp = await this.updateOperationalRestriction(this.item);
        this.onSave(resp);
      } else {
        let resp = await this.createOperationalRestriction(this.item);
        this.onSave(resp);
      }
      this.showDialog = false;
    },
  },
};
</script>
