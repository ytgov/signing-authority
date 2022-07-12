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
      authority_lines: [],
      created_by: "",
    }
  }),
  computed: {
    ...mapState("authority/formA", ["formA"]),
    defaultAuthorityLine: function () {
      return {
					"position": "New",
					"operational_restriction": "None",
					"dept": this.department.dept,
					"vote": "**",
					"prog": "**",
					"activity": "**",
					"element": "**",
					"allotment": "**",
					"object": "****",
					"ledger1": "****",
					"ledger2": "*****",
					"contracts_for_goods_services": 0,
					"authorization_for_travel": 0,
					"loans_and_guarantees": 0,
					"transfer_payments": 0,
					"request_for_goods_services": 0,
					"assignment_authority": 0,
					"s29_performance_limit": 0,
					"s30_payment_limit": 0
				}
    }
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
      this.newFormA.authority_lines.push(this.defaultAuthorityLine)
      console.log (this.newFormA)
      await this.createFormA(this.newFormA)
      this.$router.push(`/form-a/${this.formA._id}/edit`)
      }
    }
  },



}

</script>

