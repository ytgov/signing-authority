<template>
  <v-card class="default">
  <v-card-title>Form A Authorizations</v-card-title>
  <v-card-text>

    <department-form-a-summary
      :positionCount="positions.length"
      :activeFormACount="activeFormA.length" />

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
  <!-- <v-row>
    <v-spacer />
    <v-col>
  <v-card-actions>
    <create-form-a-button
      :department="getDepartmentDetails($route.params.id)"> </create-form-a-button>
  </v-card-actions>
    </v-col>
    </v-row> -->
</v-card>
</template>
<script>
import { mapActions, mapGetters } from "vuex";
import departmentFormASummary from "../components/departmentFormASummary.vue"
// import createFormAButton from '../../forms/formA/components/createFormAButton.vue';

export default {
  // components: { createFormAButton },
 name: "FormAList",
 components: {
  departmentFormASummary
 },
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
  ...mapGetters ("department",[
      "getDepartmentDetails"
    ]),
  activeFormA () {
    // return this.formAItems.filter(item => item.active);
    return this.formAItems
  },
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

