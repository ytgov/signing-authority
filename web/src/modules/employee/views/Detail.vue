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
                  :items="departments"
                  item-text="name"
                  item-value="_id"
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

        <div v-for="(item, idx) in employee.authorities" :key="idx">
          <AuthorityRenderer :authority="item"></AuthorityRenderer>
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from "vuex";
import { AUTHORITY_URL} from "@/urls"
import AuthorityRenderer from "@/modules/forms/components/AuthorityRenderer.vue";
import axios from "axios"
//import ListFiles from "../../components/forms/listFiles.vue";

export default {
  components: { AuthorityRenderer },
  computed: {
    ...mapState('department',[
      "departments"
    ]),
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
    ...mapActions("employee", [
      "loadEmployee",
      "saveEmployee",
      ]),

    createNewAuthority(){


      let authItem =  {
        department_id: this.employee.primary_department,
        employee_id: this.employee._id,
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

      axios.post(AUTHORITY_URL, authItem, {
        headers: {
          "Content-Type": "application/json"
        }
      }).then ( response => {
      //  this.$refs.notifier.showAPIMessages(response.data)
       if (response.status == 200){
         console.log("Create Successful")
         this.loadEmployee(this.employee._id)
       }
    })
    }
  },
};
</script>
