<template>
  <span>
    <v-chip v-if="isActive" dark class="mr-4 mb-1" color="yg_moss">Active</v-chip>
    <v-chip v-else class="mr-4 mb-1" dark color="yg_lichen">{{ status }}</v-chip>
    <!-- <v-chip v-if="isLocked" dark class="mr-4 mb-1" color="yg_lichen">
          <v-icon small>mdi-lock</v-icon>
        </v-chip> -->
    <form-a-status-locked v-if="isLocked"> </form-a-status-locked>
    <form-a-status-unlocked v-else></form-a-status-unlocked>
  </span>
</template>

<script>
import formAStatusLocked from "./isLocked/formAStatusLocked.vue";
import formAStatusUnlocked from "./isLocked/formAStatusUnlocked.vue";
export default {
  name: "formAStatus",
  components: {
    formAStatusLocked,
    formAStatusUnlocked,
  },
  props: {
    isActive: {
      type: Boolean,
      required: false,
      default: false,
    },
    isLocked: {
      type: Boolean,
      required: false,
      default: false,
    },
    status: { type: String },
  },
};
</script>
