<template>
    <v-dialog
      v-model="dialog"
      max-width="500px"
      persistent
    >
      <template v-slot:activator="{ on }">
        <v-chip dark class="mr-4 mb-1" color="yg_moss" v-on="on">
          <v-icon small>mdi-lock-open</v-icon>
        </v-chip>
      </template>

        <v-toolbar dark color="yg_twilight">
          <v-toolbar-title>
            Form A Lock Checks
          </v-toolbar-title>
        </v-toolbar>
         <v-card>

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
          <v-btn
            color="yg_lichen">
            Lock
          </v-btn>
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
export default {
name:"formAStatusLocked",
 data: () => ({
    dialog: false,
  }),
}
</script>

<style>

</style>