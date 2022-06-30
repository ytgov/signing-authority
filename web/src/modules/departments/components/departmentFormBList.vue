<template>
  <v-card class="default">
            <v-card-title>Active Form B Authorizations</v-card-title>
            <v-card-text>
              <v-row>
                <v-col>
                  <v-card>
                    <v-card-text class="text-h4 mb-0 pb-0">123</v-card-text>
                    <v-card-text class="mt-0 pt-0">Active</v-card-text>
                  </v-card>
                </v-col>
                <v-col>
                  <v-card>
                    <v-card-text class="text-h4 mb-0 pb-0">123</v-card-text>
                    <v-card-text class="mt-0 pt-0">Acting</v-card-text>
                  </v-card>
                </v-col>
              </v-row>

              <v-data-table
                class="mt-5"
                :headers="[
                  { text: 'Employee', value: 'name' },
                  { text: 'Position', value: 'position' },
                ]"
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
export default {
 name: "FormBList",
 props: {
  search: {
    type: String,
    default: '',
  }
 },

 data: ()=> ({
  formALink: ""
 }),
 computed: {
  formBLink () {
    return { name: "DepartmentFormBList", params: { "id": this.$route.params.id } };
  }
 },
 mounted() {
    this.selectedId = this.$route.params.id;
    this.formALink = `/departments/${this.selectedId}/form-b`;
 },
 methods: {
  openFormB() {
      this.$router.push({ name: 'DepartmentFormBList', params: { "id": this.selectedId }})
    },
 }

}
</script>

