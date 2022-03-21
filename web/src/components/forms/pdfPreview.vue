<template>
  <v-container>
     <pdf :src=pdfURL></pdf>
  </v-container>
</template>
<script>
import pdf from 'vue-pdf'
export default {
  components: {
    pdf
  },
  props: {
    pdfURL: {
            type: String,
            default: '/Jager_Tamara_SC_2020_04_01.pdf'
        }
  },

  data: () => ({

  })
}
</script>