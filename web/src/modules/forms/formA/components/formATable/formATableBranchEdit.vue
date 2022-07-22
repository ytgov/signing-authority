<template>
<v-text-field
    v-model="formA.program_branch"
    value="All Divisions, Branches and Programs"
    dense
    filled
    hide-details
    @change="itemChanged"
  ></v-text-field>
</template>
<script>
import { mapMutations, mapState } from "vuex"
export default {
  name: "formATableBranchEdit",

  data: () => ({

  }),
  computed: {
    ...mapState("authority/formA", ["formA"])
  },
  methods: {
    ...mapMutations("authority/formA", ["setFormA"]),

     itemChanged() {
      this.setFormA(this.formA);
    },
  }
}
</script>