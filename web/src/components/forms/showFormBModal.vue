<template>
  <v-container>
    <v-dialog
    v-model="dialog">
      <v-card>
        <v-card-title class="text-h5 grey lighten-2">
          Signature Card
          <v-spacer />
          <v-icon @click="$emit('close')">mdi-close</v-icon>
        </v-card-title>

        <v-card-text>
          <pdf-preview
          :pdfURL=pdfURL>
          </pdf-preview>
          <!-- <div class="text-h3 ma-6 pa-6 text-center"> PDF Goes here </div> -->
          <v-row
            justify="center">
            <v-col
            md=5>
            </v-col>
          </v-row>
        </v-card-text>
        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            text
            @click="$emit('close')"
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

  export default {
  components: {
    pdfPreview,
  },
  props: {
    pdfURL: {
      type: String,
      default: '/Jager_Tamara_SC_2020_04_01.pdf'
    }
  },
  name: "showFormBModal",
  data: () => ({

  }),
    computed: {
      dialog: function (){
        if (this.pdfURL){
          return true
        }
        return false
      }
    },

    getFile() {
      axios.get(FORMB_UPLOAD_URL)
      .then(response => {
        this.data = response.data
      })
  },

}
</script>