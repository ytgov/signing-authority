<template>
  <span>
    <v-chip dark class="mr-4 mb-1" color="blue">{{ authorityString }}</v-chip>

    <v-chip v-if="isActive" dark class="mr-4 mb-1" color="yg_moss">Active</v-chip>
    <v-chip v-else class="mr-4 mb-1" dark color="yg_lichen">Inactive</v-chip>
    <!-- <v-chip v-if="isLocked" dark class="mr-4 mb-1" color="yg_lichen">
          <v-icon small>mdi-lock</v-icon>
        </v-chip> -->
    <form-b-status-locked v-if="isLocked"> </form-b-status-locked>
    <form-b-status-unlocked v-else></form-b-status-unlocked>
  </span>
</template>

<script>
import formBStatusLocked from "./isLocked/formBStatusLocked.vue";
import formBStatusUnlocked from "./isLocked/formBStatusUnlocked.vue";
export default {
  name: "formBStatus",
  components: {
    formBStatusLocked,
    formBStatusUnlocked,
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
    authorityType: {
      type: String,
      default: "substantive",
    },
  },
  computed: {
    authorityString() {
      if (this.authorityType == "temporary") return "Temporary";
      if (this.authorityType == "acting") return "Acting";
      return "Substantive";
    },
  },
};
</script>
