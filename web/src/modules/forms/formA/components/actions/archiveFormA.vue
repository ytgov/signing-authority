<template>
  <v-dialog v-model="dialog" max-width="600px" persistent>
    <template v-slot:activator="{ on, attrs }">
      <v-list-item-title v-bind="attrs" v-on="on">
        Archive Position
      </v-list-item-title>
      <!-- <v-btn color="primary" v-bind="attrs" v-on="on">Archive Form A</v-btn> -->
    </template>
    <v-app-bar dark color="#0097A9">
      <v-toolbar-title>Archive Position : {{ position.position }}</v-toolbar-title>
      <v-spacer />
      <v-icon title="Close" @click="dialog = false">mdi-close</v-icon>
    </v-app-bar>
    <v-card tile>
      <v-card-text class="pt-6">
        <p>
          This Position currently has {{ nonCancelledCount }} related Form B records and cannot be archived until all of
          them have been cancelled.
        </p>

        <v-btn @click="doArchive" color="error" class="mr-5" :disabled="nonCancelledCount > 0">Archive</v-btn>
        <v-btn @click="dialog = false" color="secondary">Cancel</v-btn>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
<script>
import { mapActions } from "vuex";
export default {
  name: "archiveFormA",
  props: {
    position: {
      type: Object,
    },
  },
  data: () => ({
    dialog: false,
    archiveDetails: {
      reason: "Staff Change",
    },
  }),
  computed: {
    nonCancelledCount() {
      return this.position.active_authorities.filter((a) => a.status != "Cancelled").length;
    },
  },
  methods: {
    ...mapActions("authority/formA", ["archiveFormA"]),

    doArchive: async function() {
      await this.archiveFormA(this.archiveDetails);
      this.$router.push(`/departments/${this.position.department_code}/form-a`);
    },
  },
  async mounted() {
    console.log(this.position.active_authorities.length);
  },
};
</script>
