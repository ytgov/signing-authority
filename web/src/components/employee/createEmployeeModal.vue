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
            md=3>
              <v-text-field
                v-bind="userData.first_name"
                label= "First Name"
              ></v-text-field>
               <v-text-field
                v-bind="userData.last_name"
                label= "Last Name"
              ></v-text-field>
               <v-text-field
                v-bind="userData.ynet_id"
                label= "YNET ID"
              ></v-text-field>
               <v-text-field
                v-bind="userData.email"
                label= "Email"
              ></v-text-field>




            </v-col>
          </v-row>
        </v-card-text>
          <v-row>
            <v-col
            align="center">
          <v-btn
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
export default {
  name:"createEmployeeModal",
  components:{

  },

  data: () => ({
    dialog: false,
    message: "",
    userData: {
                "first_name": "",
                "last_name": "",
                "ynetid": "",
                "email": ""
              },
  }),
  computed: {
    ynetid: function() {
      return this.userData.first_name[0]+ this.userData.last_name
    }
  },
  methods: {

    // createUser: function () {
    //   console.log("Manual Create User")

    //   let file = this.currentFile
    //   let form = new FormData()

    //   // form.append("user", this.email)
    //   form.append("user", this.employee.ynet_id)
    //   form.append("uploadUser", "systemUser") //<- change out for logged in user
    //   form.append("authorityId", this.formB._id)
    //   form.append("file", file )
    //   axios.post(FORMB_UPLOAD_URL, form, {
    //   headers: {
    //     "Content-Type": "multipart/form-data"
    //   },
    // }).then ( response => {
    //    this.$refs.notifier.showAPIMessages(response.data)
    //    if (response.status == 200){
    //      //this should probably wait a second or two before returning
    //      this.$emit('uploadComplete')
    //    }
    // })
    // },
  },
}
</script>