<template>
  <v-dialog v-model="dialog" width="600" persistent>
    <template v-slot:activator="{ on, attrs }">
      <v-btn v-bind="attrs" v-on="on" color="primary" class="my-0">
        Add Employee
      </v-btn>
    </template>

    <v-app-bar color="info" dark>
      Add Employee
      <v-spacer> </v-spacer>
      <v-btn icon @click="close"><v-icon>mdi-close</v-icon></v-btn>
    </v-app-bar>

    <v-card tile>
      <v-card-text class="pt-5">
        <notifications ref="notifier"></notifications>

        <v-form v-model="formValid" lazy-validation>
          <v-text-field
            v-model="first_name"
            dense
            outlined
            label="First name"
            :rules="[rules.required]"
          ></v-text-field>

          <v-text-field
            v-model="last_name"
            dense
            outlined
            label="Last name"
            :rules="[rules.required]"
          ></v-text-field>

          <v-text-field
            v-model="ynet_id"
            dense
            outlined
            label="YNET ID"
            :rules="[rules.required]"
          ></v-text-field>

          <v-text-field
            v-model="email"
            dense
            outlined
            label="Email"
            :rules="[rules.required]"
          ></v-text-field>

          <v-btn :disabled="!formValid" @click="createUser" color="primary">
            Save
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
<script>
import api from "@/auth/axiosAPIConfig";
import { EMPLOYEE_URL } from "../../urls";
export default {
  name: "createEmployeeModal",
  components: {},

  data: () => ({
    dialog: false,
    message: "",
    formValid: false,
    first_name: "",
    last_name: "",
    ynet_id: "",
    email: "",
    rules: {
      required: (value) => !!value || "This field is required.",
    },
  }),
  computed: {
    ynetid: function () {
      return this.first_name[0] + this.last_name;
    },
    form: function () {
      return {
        first_name: this.first_name,
        last_name: this.last_name,
        ynet_id: this.ynet_id,
        email: this.email,
      };
    },
  },
  methods: {
    createUser: function () {
      api.post(EMPLOYEE_URL, this.form).then((response) => {
        this.$refs.notifier.showAPIMessages(response.data);
        if (response.status == 200) {
          this.$router.replace({
            path: `/employee/${response.data.insertedId}`,
          });
          //this should probably wait a second or two before returning
        }
      });
    },
    close() {
      this.dialog = false;
      this.first_name = "";
      this.last_name = "";
      this.email = "";
      this.ynet_id = "";
    },
  },
};
</script>