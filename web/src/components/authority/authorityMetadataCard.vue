<template>
  <v-card>
  <v-card-title class="text-h5 grey lighten-2">Authority Metadata</v-card-title>
    <v-card-text>
      {{formB}}
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: "authorityMetaDataCard",

  props: {
    formB: {
      type: Object,

    }
  },
  data: () => ({

  }),

}
</script>

<style>

</style>