<template>
  <v-card class="default">
            <v-card-title>Active Form B Authorizations</v-card-title>
            <v-card-text>
              <v-row>
                <v-col>
                  <v-card
                  :to="formBLink">
                    <v-card-text class="text-h4 mb-0 pb-0">{{activeFormB}}</v-card-text>
                    <v-card-text class="mt-0 pt-0">Active</v-card-text>
                  </v-card>
                </v-col>
                <v-col>
                  <v-card
                  :to="formBLink">
                    <v-card-text class="text-h4 mb-0 pb-0">{{actingFormB}}</v-card-text>
                    <v-card-text class="mt-0 pt-0">Acting</v-card-text>
                  </v-card>
                </v-col>
              </v-row>

              <v-data-table
                class="mt-5"
                :headers="headers"
                :search="search"
                :items="formBItems"
                :loading="loadingFormB"
                @click:row="openFormB"
              >
              </v-data-table>

              <div class="mt-4 ml-2">
                <router-link :to="formBLink">View all</router-link>
              </div>
            </v-card-text>
          </v-card>
</template>
<script>
import {mapActions} from "vuex"
export default {
 name: "FormBList",
 props: {
  search: {
    type: String,
    default: '',
  }
 },

 data: ()=> ({
  formALink: "",
  formBItems: [],
  loadingFormB: false,
  headers:[
                  { text: 'Employee', value: 'employee_name' },
                  { text: 'Position', value: 'title' },
                ]
 }),
 computed: {
  formBLink () {
    return { name: "DepartmentFormBList", params: { "id": this.$route.params.id } };
  },
  activeFormB () {
    return this.formBItems.length
  },
  actingFormB () {
    return 0
  }
 },
 mounted: async function () {
    this.selectedId = this.$route.params.id;
    console.log(`Department code: ${this.$route.params.id}`)
    this.formALink = `/departments/${this.selectedId}/form-b`;
    this.formBItems = await this.getFormBList(this.$route.params.id)
 },
 methods: {
  openFormB() {
      this.$router.push({ name: 'DepartmentFormBList', params: { "id": this.selectedId }})
    },
  ...mapActions("forms/formB", ["getFormBList"])
 }

}
</script>

