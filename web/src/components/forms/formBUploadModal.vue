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
          Signature Card
        </v-btn>
      </template>

      <v-card>
        <v-card-title class="text-h5 grey lighten-2">
          Signature Card
          <v-spacer />
          <v-icon @click="dialog=false">mdi-close</v-icon>
        </v-card-title>

        <v-card-text>
          <div class="text-h3 ma-6 pa-6 text-center"> PDF Goes here </div>
          <v-row
            justify="center">
            <v-col md="3">
              <v-file-input
                truncate-length="15"
                label= "mySigningAuthorityForm.pdf"
              ></v-file-input>
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
  export default {
  name: "FormBUploadModal",
  data: () => ({
    dialog: false
  }),
  methods: {

  }
}
</script>