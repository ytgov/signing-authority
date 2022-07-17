<template>
  <v-row class=pb-5>
    <v-col>
      <v-card
        :to="formALink">
          <v-card-text class="text-h4 mb-0 pb-0">{{ activeFormACount}}</v-card-text>
          <v-card-text class="mt-0 pt-0">Active Form A's</v-card-text>
      </v-card>
    </v-col>
    <v-col>
      <v-card
        :to="formALink">
          <v-card-text class="text-h4 mb-0 pb-0">{{positionCount}}</v-card-text>
          <v-card-text class="mt-0 pt-0">Positions</v-card-text>
        </v-card>
    </v-col>
  </v-row>
</template>
<script>
export default {
  name: "departmentFormASummary",
  props: {
    activeFormACount: {
      type: String,
      default: "",
    },
    positionCount: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    formALink () {
    return { name: "DepartmentFormAList", params: { "id": this.$route.params.id } };
  },
  }
}
</script>