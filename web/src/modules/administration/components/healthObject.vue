<template>
<v-container>
  <span class="text-h5 pr-3">{{title}}
      </span>
        <span>
        <v-btn
          small

          dark
          fab
          color="green"
          v-if="status == true">
          <v-icon

          >
            mdi-check
          </v-icon>
        </v-btn>
        <v-btn
        v-else
          small
          dark
          fab
          color="red"
        >
        <v-icon>
        mdi-close
        </v-icon>
        </v-btn>
      </span>
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