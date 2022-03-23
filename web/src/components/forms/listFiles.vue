<template>
<v-container>
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
    ]">
  </v-data-table>
</v-container>
</template>

<script>
import axios from "axios"
import {FORMB_UPLOAD_URL} from "../../urls"

export default {
  name: "listFiles",
  data: () => ({
    files: [],
  }),
  methods: {
    getAllFiles() {
      axios.get(FORMB_UPLOAD_URL)
      .then(response => {
        this.files = response.data.data
      })

    }
  }

}
</script>