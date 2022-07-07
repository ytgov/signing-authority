<template>
   <v-btn color="primary"
   @click="doIt()">Add Form A</v-btn>

</template>

<script>
import { mapActions, mapState } from "vuex";
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
    newFormA: {
      department_code: "Empty",
      department_descr: "Empty",
      program_branch: "all",
      issue_date: new Date(),
      reviewed_by_department: false,
      created_by: "",
    },
  }),
  computed: {
    ...mapState("authority/formA", ["formA"])
  },
  methods: {
    ...mapActions("authority/formA", ["createFormA"]),

    doIt: async function () {
      if (this.department == null){
        this.$refs.notifier.showAPIMessages("Cannot create Form A. No deparment specificed")
      } else {
      this.newFormA.department_code = this.department.dept
      this.newFormA.department_descr = this.department.descr
      this.newFormA.created_by = this.$auth.user.email
      await this.createFormA(this.newFormA)
      this.$router.push(`/form-a/${this.formA._id}`)
      }
    }
  },



}

</script>

