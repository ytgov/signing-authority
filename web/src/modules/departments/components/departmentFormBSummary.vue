<template>
  <v-row>
    <v-col>
      <v-card
        :to="formBLink">
          <v-card-text class="text-h4 mb-0 pb-0">{{ activeFormBCount}}</v-card-text>
          <v-card-text class="mt-0 pt-0">Active Form B's</v-card-text>
      </v-card>
    </v-col>
    <v-col>
      <v-card
        :to="formBLink">
          <v-card-text class="text-h4 mb-0 pb-0">{{actingCount}}</v-card-text>
          <v-card-text class="mt-0 pt-0">Acting</v-card-text>
        </v-card>
    </v-col>
  </v-row>
</template>
<script>
export default {
  name: "departmentFormBSummary",
  props: {
    activeFormBCount: {
      type: String,
      default: "",
    },
    actingCount: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    formBLink () {
    return { name: "DepartmentFormBList", params: { "id": this.$route.params.id } };
  },
  }
}
</script>