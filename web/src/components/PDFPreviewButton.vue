<template>
  <div>
    <v-dialog v-model="dialog">
      <template v-slot:activator="{ on, attrs }">
        <v-btn color="primary" v-bind="attrs" v-on="on">Preview</v-btn>
      </template>

      <v-card>
        <v-card-title class="text-h5 grey lighten-2">
          Signature Card
          <v-spacer />
          <v-icon @click="dialog = false">mdi-close</v-icon>
        </v-card-title>

        <v-card-text>
          <pdf-preview :pdfFile="pdfFile"></pdf-preview>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import pdfPreview from "./forms/pdfPreview";

export default {
  props: ["pdfFile"],
  components: { pdfPreview },
  data: () => ({
    dialog: false,
  }),
};
</script>