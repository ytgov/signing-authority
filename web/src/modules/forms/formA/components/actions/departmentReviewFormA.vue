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
        Review Form A
      </v-toolbar-title>
    </v-toolbar>
    <v-card>

      <v-card-text>
      <v-row align="center" class="pt-7">

        <v-checkbox
          hide-details
          class="shrink mr-2 mt-0"
        ></v-checkbox>
         <a href="http://locatlhost:8080/Jager_Tamara_SC_2020_04_01.pdf">Uploaded-form-a.pdf</a> correct and matches the system.
        <!-- <v-text-field label="Uploaded Form A"></v-text-field> -->
      </v-row>
      <v-row align="center">
        <v-checkbox
          hide-details
          class="shrink mr-2 mt-0"
          label="Deputy Correct"
        ></v-checkbox>
      </v-row>
        <v-row align="center">
        <v-checkbox
          hide-details
          class="shrink mr-2 mt-0"
          label="Form A signed"
        ></v-checkbox>
      </v-row>

      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions>
        <!-- Do a confirmation dialog -->
        <v-btn
          color="yg_lichen">
          Lock and Activate
        </v-btn>
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
export default {
name:"departmentReviewFormA",
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