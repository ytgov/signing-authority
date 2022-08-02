<template>
  <v-dialog
      v-model="dialog"
      max-width="500px"
      persistent
    >
      <template v-slot:activator="{ on }">
        <v-chip dark class="mr-4 mb-1" color="yg_lichen" v-on="on">
          <v-icon small>mdi-lock</v-icon>
        </v-chip>
      </template>

        <v-toolbar dark color="yg_twilight">
          <v-toolbar-title>
            Form B - Locked by {{formB.reviewed_by_person}}
          </v-toolbar-title>
        </v-toolbar>
         <v-card>

        <v-card-text>
          <p class="pt-5"> This Form B was reviewed by {{formB.reviewed_by_person || "Anonymous"}} on {{formB.reviewed_by_date || "Date"}} </p>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            @click="dialog = false"
          >
             Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
</template>

<script>
import { mapState } from "vuex";
export default {
  name:"formAStatusLocked",
  computed: {
    ...mapState("authority/formB", ["formB"]),
  },
  data: () => ({
    dialog: false,
  }),
}
</script>

