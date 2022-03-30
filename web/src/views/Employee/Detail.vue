<template>
  <div>
    <v-breadcrumbs :items="breadcrumbs"></v-breadcrumbs>

    <h1>
      {{ employee.first_name }} {{ employee.last_name }}
      <small> ({{ employee.ynet_id }})</small>
    </h1>
    <v-row>
      <v-col cols="12" sm="6">
        <h3>Employee Details</h3>
        <v-card class="default">
          <v-card-text>
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="employee.first_name"
                  dense
                  outlined
                  background-color="white"
                  label="First name"
                  hide-details
                >
                </v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="employee.last_name"
                  dense
                  outlined
                  background-color="white"
                  label="Last name"
                  hide-details
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="employee.employee_id"
                  dense
                  outlined
                  background-color="white"
                  label="Employee Id"
                  hide-details
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="employee.ynet_id"
                  dense
                  outlined
                  background-color="white"
                  label="YNET Id"
                  hide-details
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="12">
                <v-text-field
                  v-model="employee.email"
                  dense
                  outlined
                  background-color="white"
                  label="Email"
                  hide-details
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="12">
                <v-select
                  v-model="employee.primary_department"
                  dense
                  outlined
                  background-color="white"
                  label="Primary department"
                  hide-details
                  :items="[
                    'Highways and Public Works',
                    'Justice',
                    'Community Services',
                  ]"
                ></v-select>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-btn
                  color="primary"
                  class="mb-0 mt-5"
                  @click="saveEmployee">
                  Save
                </v-btn>
              </v-col>
               <v-spacer></v-spacer>
              <v-col>
                <v-btn
                  class="mb-0 mt-5 mr-0"
                  color= "primary"
                  @click="createNewAuthority()">
                  Create New Authority
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!--  <list-files></list-files> -->
      </v-col>

      <v-col cols="12" sm="6">
        <h3>Authorities:</h3>

        <div v-for="(item, idx) of employee.authorities" :key="idx">
          <AuthorityRenderer :authority="item"></AuthorityRenderer>
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import AuthorityRenderer from "../../components/authority/AuthorityRenderer.vue";
//import ListFiles from "../../components/forms/listFiles.vue";

export default {
  components: { AuthorityRenderer },
  computed: {
    ...mapGetters("employee", ["employee"]),
    breadcrumbs: function () {
      let b = [{ text: "Dashboard", to: "/dashboard" }];
      b.push({
        text: `${this.employee.first_name} ${this.employee.last_name}`,
      });
      return b;
    },
  },
  watch: {},
  data: () => ({}),
  async mounted() {
    this.loadEmployee(this.$route.params.id);
  },
  methods: {
    ...mapActions("employee", ["loadEmployee", "saveEmployee"]),

    createNewAuthority(){
      let authItem =  {
        department_id: "62352f6b508beda988972511",
        employee_id: "62352f6b508beda98897250e",
        issue_date: new Date(),
        title: "",
        program: "",
        supervisor_name: "",
        reviewed_by_department: false,
        employee_signed: false,
        supervisor_signed: false,
        supervisor_title: "",
        authority_lines: []
      }
      console.log(authItem)
    }
  },
};
</script>
