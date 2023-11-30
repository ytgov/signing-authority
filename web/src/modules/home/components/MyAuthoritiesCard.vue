<template>
  <div>
    <v-card color="#fff2d5" :loading="loadingMyAuthorities" :disabled="loadingMyAuthorities != ''">
      <v-card-title>My Authorities</v-card-title>
      <v-card-text>
        <v-list v-if="myAuthorities.length > 0" dense class="py-0" style="border: 1px #ccc solid; border-radius: 4px;">
          <div v-for="(formB, idx) of myAuthorities" :key="idx">
            <v-list-item two-line :to="`/form-b/${formB._id}`" :style="`background-color: ${getColor(formB)}`">
              <v-list-item-content>
                <v-list-item-title>{{ formB.department_descr }} - {{ formB.employee.title }}</v-list-item-title>
                <v-list-item-subtitle>
                  <strong>{{ toTitleCase(formB.authority_type) }}</strong> - {{ formB.status }}</v-list-item-subtitle
                >
              </v-list-item-content>
            </v-list-item>
            <v-divider v-if="idx < myAuthorities.length - 1"></v-divider>
          </div>
        </v-list>
        <div v-else>
          You have no authorities
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import { mapState } from "vuex";

export default {
  name: "Home",
  data: () => ({
    search: "",
    drawer: null,
    searchResults: [],
    loading: false,
  }),
  mounted() {},
  computed: {
    ...mapState("home", ["myAuthorities", "loadingMyAuthorities"]),
  },
  methods: {
    getColor(formB) {
      if (formB.status == "Active") return "#4caf5066";
      return "#cccccc66";
    },
    toTitleCase(str) {
      return str.replace(/\w\S*/g, function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      });
    },
  },
};
</script>
