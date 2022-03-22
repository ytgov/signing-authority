<template>
  <v-container>
    <v-dialog
    v-model="dialog">
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          color="primary "
          v-bind="attrs"
          v-on="on"
        >
         Specimen Signature Card
        </v-btn>
      </template>

      <v-card>
        <v-card-title class="text-h5 grey lighten-2">
          Signature Card
          <v-spacer />
          <v-icon @click="dialog=false">mdi-close</v-icon>
        </v-card-title>

        <v-card-text>
          <v-row>
            <v-col>
               <v-snackbar v-model="visible" right :color="color">
    <v-icon class="mr-3">mdi-error</v-icon>
    SomeTest
  </v-snackbar>
           <notifications ref="notifier"></notifications>
            </v-col>
          </v-row>
          <pdf-preview></pdf-preview>
          <!-- <div class="text-h3 ma-6 pa-6 text-center"> PDF Goes here </div> -->
          <v-row
            justify="center">
            <v-col
            md=5>
              <upload-file> </upload-file>
            </v-col>
          </v-row>
        </v-card-text>
        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            text
            @click="dialog=false"
          >
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
<script>
  import axios from "axios"
  import {FORMB_UPLOAD_URL} from "../../urls"
  import pdfPreview from "./pdfPreview"
  import notifications from "../Notifications"
  import uploadFile from "./uploadFormB.vue"

  export default {
  components: {
    pdfPreview,
    notifications,
    uploadFile, },
  name: "showFormBModal",
  data: () => ({

  }),

    getFile() {
      axios.get(FORMB_UPLOAD_URL)
      .then(response => {
        this.data = response.data
      })
  }

}
</script>