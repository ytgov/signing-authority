<template>
   <v-btn color="primary"
   @click="doIt()">Add Form A</v-btn>

</template>

<script>
import { mapActions } from "vuex";
export default {
  name: "CreateFormAButton",
  props: {
    department: {
      type: Object,
      required: true
    }
  },
  data: () => ({
    //see <projectroot>/api/data/models/formA.ts for details
    formA: {
      department_code: "Empty",
      department_descr: "Empty",
      program_branch: "all",
      issue_date: new Date(),
      reviewed_by_department: false,
      created_by: "",
}

    // }
  }),
  methods: {
    ...mapActions("authority/formA", ["createFormA"]),

    doIt: async function () {
      this.formA.department_code = this.department.dept
      this.formA.department_descr = this.department.descr
      this.formA.created_by = this.$auth.user.email
      await this.createFormA(this.formA)

    }
  },



}

</script>

