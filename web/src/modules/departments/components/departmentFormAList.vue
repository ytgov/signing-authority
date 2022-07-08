<template>
  <v-card class="default">
  <v-card-title>Form A Authorizations</v-card-title>
  <v-card-text>
    <v-data-table
      :headers="[
                //{ text: 'Department', value: 'department' },
                { text: 'Division', value: 'division' },
                { text: 'Position', value: 'position' },

                ]"
      :search="search"
      :items=" positions"
      :loading="loadingFormA"
      @click:row="openFormA"
    >
    </v-data-table>
    <div class="mt-4 ml-2">
      <router-link :to="formALink">View all</router-link>
    </div>
  </v-card-text>
</v-card>
</template>
<script>
import { mapActions } from "vuex";

export default {
 name: "FormAList",
 props: {
  // formAItems: {
  //  type: Array,
  //  default: () => [],
  // },
  // loadingFormA: {
  //  type: Boolean,
  //  default: false,
  // },
  search: {
    type: String,
    default: '',
  }
 },

 data: ()=> ({
  formAItems: [],
  loadingFormA: false,
 }),
 computed: {
  formALink () {
    return { name: "DepartmentFormAList", params: { "id": this.$route.params.id } };
  },
  positions () {
    const x = this.formAItems.flatMap(a => (
      a.authority_lines.map(b => ({"department":a.department_descr, "division":a.program_branch, "position":b.position, "_id":a._id}))
    ))
    return x
  }
 },
 mounted: async function () {
    this.formAItems = await this.getDepartmentFormAList(this.$route.params.id);
    this.loadingFormA = false;
 },
 methods: {
  ...mapActions("forms/formA", [
    "getDepartmentFormAList",
  ]),
  openFormA(item) {
    console.log (item)
      this.$router.push({
        path: `/form-a/${item._id}`,
      })
    },
 }

}
</script>

