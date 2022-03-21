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
           <v-alert-text>
              {{message}}
           </v-alert-text>
            </v-col>
          </v-row>
          <pdf-preview></pdf-preview>
          <!-- <div class="text-h3 ma-6 pa-6 text-center"> PDF Goes here </div> -->
          <v-row
            justify="center">
            <v-col md="3">
              <v-file-input
                truncate-length="15"
                @change="selectFile"
              ></v-file-input>

            </v-col>
   <v-btn
              @click="upload()"
              :disabled="!currentFile ? true : false"
              color="primary"
              class="mx-5"> Upload </v-btn>
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
  export default {
  components: { pdfPreview },
  name: "FormBUploadModal",
  data: () => ({
    dialog: false,
    currentFile: undefined,
    message: "",
    data: {"data": "Empty"}

  }),
  methods: {
    selectFile: function (file){
      console.log(file)
      this.currentFile = file;
    },
    upload: function () {
      console.log("Upload")
      if (!this.currentFile) {
        this.message = "Please select a file"
        return
      }
      let file = this.currentFile
      let form = new FormData()
      form.append("user", "vueUser" )
      form.append("file", file )
      axios.post(FORMB_UPLOAD_URL, form, {
      headers: {
        "Content-Type": "multipart/form-data"
      },
    }).then( response => {
      console.log( response)
    })
    },
    getFile() {
      axios.get(FORMB_UPLOAD_URL)
      .then(response => {
        this.data = response.data
      })
  }

  }
}
</script>