<template>
  <v-container>
    <pdf :src="pdfFile"></pdf>
  </v-container>
</template>

<script>
import pdf from "vue-pdf";

export default {
  components: { pdf },
  props: ["pdfFile"],
};
</script>