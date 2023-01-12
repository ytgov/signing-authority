<template>
  <span>
    <v-chip dark class="mr-4 mb-1" :color="status == 'Active' ? 'yg_moss' : 'yg_lichen'">{{ status }}</v-chip>

    <form-a-status-locked v-if="isLocked"> </form-a-status-locked>
    <form-a-status-unlocked v-else></form-a-status-unlocked>
  </span>
</template>

<script>
import formAStatusLocked from "./isLocked/formAStatusLocked.vue";
import formAStatusUnlocked from "./isLocked/formAStatusUnlocked.vue";
import { mapState } from "vuex";

export default {
  name: "formAStatus",
  components: {
    formAStatusLocked,
    formAStatusUnlocked,
  },
  computed: {
    ...mapState("authority/formA", ["formA"]),
    isActive() {
      return this.formA.status == "Active";
    },
  },
  props: {
    isLocked: {
      type: Boolean,
      required: false,
      default: false,
    },
    status: { type: String },
  },
};
</script>
