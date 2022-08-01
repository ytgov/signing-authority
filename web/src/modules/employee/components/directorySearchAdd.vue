<template>
  <div>
    <p>For employees already in the system select them from the first field</p>
    <v-row>
      <v-col>
        <v-autocomplete
          label="Employee"
          dense
          outlined
          hide-no-data
          hide-selected
          :items="employeeItems"
          item-text="display_name"
          item-value="_id"
          :loading="isEmployeeLoading"
          :search-input.sync="employeeSearch"
          v-model="employeeId"
        ></v-autocomplete>
      </v-col>
      <v-col>
        <v-btn color="primary" class="my-0 pt-3" small text>Not found?</v-btn>
      </v-col>
      <v-col>
        <v-autocomplete
          label="Employee"
          dense
          outlined
          hide-no-data
          hide-selected
          :items="employeeItems"
          item-text="display_name"
          item-value="_id"
          :loading="isEmployeeLoading"
          :search-input.sync="employeeSearch"
          v-model="employeeId"
        ></v-autocomplete>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { mapActions } from "vuex";

export default {
  name: "DirectorySearchAdd",
  props: {},
  data: () => ({
    isEmployeeLoading: false,
    employeeItems: [],
    employeeSearch: "",

    employeeId: "",
  }),
  methods: {
    ...mapActions("employee", ["searchEmployees", "searchDirectory"]),
  },
};
</script>
