<template>
    <v-dialog
    v-model="dialog">
      <template v-slot:activator="{ on, attrs }">
        <v-list-item-title
          v-bind="attrs"
          v-on="on"
        >
         Upload Signed PDF
        </v-list-item-title>
      </template>

      <v-card>
        <v-card-title class="text-h5 grey lighten-2">
          Upload Signature Card
          <v-spacer />
          <v-icon @click="dialog=false">mdi-close</v-icon>
        </v-card-title>

        <v-card-text>
          <v-row>
            <v-col>
           <notifications ref="notifier"></notifications>
            </v-col>
          </v-row>

          <v-row
            justify="center">
            <v-col
            md=5>
            <upload-form-b-button
            :authorityID="authorityID"
            @uploadComplete="dialog=false"></upload-form-b-button>
              <!-- <upload-file> </upload-file> -->
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
</template>
<script>
// import UploadFormBButton from './uploadFormBButton.vue'
import UploadFormBButton from './uploadFormBButton.vue'
export default {
  name:"uploadModal",
  props: {
    authorityID: {
      type: String,
      default: '000000000000'
    }
  },
  components:{
    UploadFormBButton
  },

  data: () => ({
    dialog: false,

  })

}
</script>