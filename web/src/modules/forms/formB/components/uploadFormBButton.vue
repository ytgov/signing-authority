<template>
  <v-container>
    <notifications ref="notifier"></notifications>
    <v-row>
      <v-col
       md="9">
        <v-file-input
        truncate-length="50"
        @change="selectFile"
        ></v-file-input>
      </v-col>

      <v-col>
        <v-btn
          @click="upload()"
          :disabled="!currentFile ? true : false"
          color="primary"
          class=""> Upload </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import {FORMB_UPLOAD_URL} from "@/urls"
import axios from "axios"
import { mapGetters, mapState } from 'vuex'
import notifications from "@/components/Notifications"
export default {
  name:"uploadFile",
  components:{
    notifications
  },
  props: {
    uploadUser: {
      type: String,
      default: 'defaultSystemUser'
    },
    fileType: {
      type: String,
      default: 'formB'
    },
    authorityID: {
      type: String,
      default: '000000000000'
    }
  },
  data: () => ({
    dialog: false,
    currentFile: undefined,
    //uploadUser: "systemUser",
    message: "",
    data: {"data": "Empty"},
  }),
  computed: {
    ...mapGetters("authority",[
      "formB"
    ]),

    ...mapState('employee',[
      'employee'
    ])
  },
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

      // form.append("user", this.email)
      form.append("user", this.employee.ynet_id)
      form.append("uploadUser", "systemUser") //<- change out for logged in user
      form.append("authorityId", this.formB._id)
      form.append("file", file )
      axios.post(FORMB_UPLOAD_URL, form, {
      headers: {
        "Content-Type": "multipart/form-data"
      },
    }).then ( response => {
       this.$refs.notifier.showAPIMessages(response.data)
       if (response.status == 200){
         //this should probably wait a second or two before returning
         this.$emit('uploadComplete')
       }
    })
    },
  },
}
</script>