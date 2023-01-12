<template>
  <v-dialog
    v-model="dialog"
    max-width="500px"
    persistent
  >
    <template v-slot:activator="{ on }">
      <span v-on="on">
        <slot name="content">
        </slot>
      </span>
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
          <li>Download PDF</li>
          <li>Get Signatures </li>
          <li>Upload Signed PDF </li>
          <li>Complete Departmental Review </li>
        </ol>
        <p class="pt-5"> If locked this will show who reviewed this Form A and when they approved it</p>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions>
        <department-review-form-a>
          <template v-slot:content>
            <v-btn
              color="yg_lichen">
              Lock
            </v-btn>
          </template>
        </department-review-form-a>
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          @click="dialog = false">
            Close
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

</template>

<script>
import departmentReviewFormA from './departmentReviewFormA.vue'
export default {
  components: { departmentReviewFormA },
name:"formAStatusLocked",
 data: () => ({
    dialog: false,
  }),
  methods: {
    boo: function () {
      console.log ("click")
    }

  }
}
</script>

<style>

</style>