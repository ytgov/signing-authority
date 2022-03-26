<template>
<v-container>
  {{pdfURL}}
  <v-btn
    @click="getAllFiles()"
    color="primary">
      Load all files
  </v-btn> <br />

  <v-data-table
    :items="files"
    :headers="[
      { text: 'File Name', value: 'filename' },
      { text: 'Uploaded By', value: 'uploadedBy' },
      { text: 'Upload Date', value: 'uploadDate' }
    ]"
   >

  <template v-slot:item.filename="{ item }">
     <span  @click="previewFile(item)">
        {{ item.filename }}
     </span>
  </template>

  <template v-slot:item.uploadDate="{ item }">
    {{prettyDate(item.uploadDate)}}
  </template>

  </v-data-table>


  <show-form-b-modal
    :pdfURL="pdfURL"
    @close="pdfURL=''"/>
</v-container>
</template>

<script>
import axios from "axios"
import {FORMB_UPLOAD_URL} from "../../urls"
import showFormBModal from './showFormBModal.vue'

export default {
  components: {
    showFormBModal
    },
  name: "listFiles",
  data: () => ({
    files: [],
    pdfURL: ""
  }),
  methods: {
    getAllFiles() { //<- Change this to be file list
      axios.get(FORMB_UPLOAD_URL)
      .then(response => {
        this.files = response.data.data
      })

    },
    previewFile(item) {
      let url = FORMB_UPLOAD_URL +`/${item.id}/file`
      this.pdfURL = url

    },
    prettyDate(date) {
      return new Date(date).toLocaleString()
    }
  }
}
</script>