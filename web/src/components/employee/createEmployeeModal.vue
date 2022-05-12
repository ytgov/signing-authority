<template>
   <v-dialog
    v-model="dialog"
     width="600">
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          v-bind="attrs"
          v-on="on"
          color="primary"
        >
        Create New Employee
        </v-btn>
      </template>

      <v-card>
        <v-card-title class="text-h5 grey lighten-2">
          New Employee
          <v-spacer />
          <v-icon @click="dialog=false">mdi-close</v-icon>
        </v-card-title>

        <v-card-text>
          <v-row>
            <v-col>
           <notifications ref="notifier"></notifications>
            </v-col>
          </v-row>

          <v-row
            justify="center">
            <v-col
            md=5>
            <v-form v-model="formValid">
              <v-text-field
                v-model="first_name"
                label= "First Name"
                :rules="[rules.required]"
              ></v-text-field>
               <v-text-field
                v-model="last_name"
                label= "Last Name"
                :rules="[rules.required]"
              ></v-text-field>
               <v-text-field
                v-model="ynet_id"
                label= "YNET ID"
                :rules="[rules.required]"
              ></v-text-field>
               <v-text-field
                v-model="email"
                label= "Email"
                :rules="[rules.required]"
              ></v-text-field>
            </v-form>
            </v-col>
          </v-row>
        </v-card-text>
          <v-row>
            <v-col
            align="center">
            <v-btn
                :disabled=!formValid
                @click = "createUser"
                color="secondary">
                Create Employee
              </v-btn>
            </v-col>
          </v-row>
        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            text
            @click="dialog=false"
          >
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
</template>
<script>
import axios from "axios"
import { EMPLOYEE_URL} from "../../urls"
export default {
  name:"createEmployeeModal",
  components:{

  },

  data: () => ({
    dialog: false,
    message: "",
    formValid: false,
    first_name: "",
    last_name: "",
    ynet_id: "",
    email: "",
    rules: {
      required: value => !!value || 'This field is required.'
     }
  }),
  computed: {
    ynetid: function() {
      return this.first_name[0]+ this.last_name
    },
    form: function () {
      return {
        first_name: this.first_name,
        last_name: this.last_name,
        ynet_id: this.ynet_id,
        email: this.email
      }
    }
  },
  methods: {

    createUser: function () {
      console.log("Manual Create User")
      console.log(this.form)
      axios.post(EMPLOYEE_URL, this.form, {
        headers: {
          "Content-Type": "application/json"
        },
      }).then ( response => {
        console.log(response.data)
       this.$refs.notifier.showAPIMessages(response.data)
       if (response.status == 200){
         this.$router.replace({path:`/employee/${response.data.insertedId}`})
         //this should probably wait a second or two before returning
       }
      })
    },
  },
}
</script>