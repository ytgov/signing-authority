<template>
<v-container>
  <v-row>
    <v-col
      cols ="2">
      <v-btn
        x-small
        dark
        fab
        color="green"
        v-if="status == true">
          <v-icon>
            mdi-check
          </v-icon>
      </v-btn>
      <v-btn
        v-else
        x-small
        dark
        fab
        color="red">
        <v-icon>
          mdi-close
        </v-icon>
      </v-btn>
    </v-col>
    <v-col
      cols="10">
  <span class="text-button">{{title}}
      </span>
    </v-col>

  </v-row>
</v-container>
</template>

<script>
export default {
name: "healthObject",
  props: {
    title: {
      type: String,
      default: "",
    },
    status: {
      type: Boolean,
      default: false,
    },
  }
}
</script>

<style>

</style>