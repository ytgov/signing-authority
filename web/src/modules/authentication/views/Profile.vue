<template>
  <div>
    <h1>My Profile</h1>
    <p>
      ** This information is all read-only with the exception of your Mail code
    </p>

    <div class="row">
      <div class="col-md-6">
        <v-text-field
          v-model="firstName"
          dense
          outlined
          label="First name"
          readonly
          hide-details
          append-icon="mdi-lock"
        ></v-text-field>
      </div>
      <div class="col-md-6">
        <v-text-field
          v-model="lastName"
          dense
          outlined
          label="Last name"
          readonly
          hide-details
          append-icon="mdi-lock"
        ></v-text-field>
      </div>

      <div class="col-md-6">
        <v-text-field
          v-model="email"
          dense
          outlined
          label="Email"
          readonly
          hide-details
          append-icon="mdi-lock"
        ></v-text-field>
      </div>
      <div class="col-md-6">
        <v-text-field
          dense
          outlined
          label="Roles"
          v-model="myRoles"
          readonly
          append-icon="mdi-lock"
          hide-details
        >
        </v-text-field>
      </div>

    </div>
    <notifications ref="notifier"></notifications>
  </div>
</template>

<script>
import { mapState } from "vuex";
import store from "@/store";

export default {
  name: "Profile",
  computed: {
    ...mapState("profile", [
      "firstName",
      "lastName",
      "username",
      "email",
      "roles",
    ]),
    myRoles: function () {
      if (this.roles && this.roles.length > 0) return this.roles.join(", ");

      return "";
    },
  },
  data: () => ({}),
  async created() {
    await store.dispatch("profile/loadProfile");
  },
  methods: {
  },
};
</script>
