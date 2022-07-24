<template>
  <span>

    <v-chip v-if="isActive" dark class="mr-4 mb-1" color="yg_moss">Active</v-chip>
    <v-chip v-else class="mr-4 mb-1" dark color="yg_lichen">Inactive</v-chip>

    <v-dialog
      v-model="dialog"
      width="500"
    >
      <template v-slot:activator="{ on }">
        <v-chip v-if="isLocked" dark class="mr-4 mb-1" color="yg_lichen">
          <v-icon small>mdi-lock</v-icon>
        </v-chip>

        <v-chip v-else dark class="mr-4 mb-1" color="yg_moss" v-on="on">
          <v-icon small>mdi-lock-open</v-icon>
        </v-chip>
      </template>
      <v-card>
        <v-toolbar dark color="yg_twilight">
          <v-toolbar-title class="text-h5  lighten-2">
            Form A Lock Checks
          </v-toolbar-title>
        </v-toolbar>

        <v-card-text>
          <p class="pt-5"> If unlocked, this could be the steps to lock/check a form A</p>
          <ol >
            <li>Check One</li>
            <li>Check Two</li>
            <li>Check Three</li>
          </ol>
          <p class="pt-5"> If locked this could show who reviewed this Form A and when they approved it</p>
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
  </span>
</template>

<script>
export default {
  name: "formAStatus",
  props: {
    isActive: {
      type: Boolean,
      required: false,
      default: false
    },
    isLocked: {
      type: Boolean,
      required: false,
      default: false
    },
  },
  data: () => ({
    dialog: false,
  }),
}
</script>

