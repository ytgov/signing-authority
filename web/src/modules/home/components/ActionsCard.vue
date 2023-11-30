<template>
  <div>
    <v-card class="mb-6" color="#fff2d5" :loading="loadingMyActions" :disabled="loadingMyActions != ''">
      <v-card-title class="d-flex">
        Pending Actions
        <v-spacer></v-spacer>
        <v-btn icon color="primary" class="my-0" title="Reload" @click="loadActions">
          <v-icon>mdi-refresh</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-list v-if="actions.length > 0" class="py-0" dense style="border: 1px #ccc solid; border-radius: 4px;">
          <div v-for="(action, idx) of actions" :key="idx">
            <v-list-item two-line :to="action.url">
              <v-list-item-icon class="mt-5">
                <v-icon>{{ getIcon(action) }}</v-icon>
              </v-list-item-icon>

              <v-list-item-content>
                <v-list-item-title>{{ action.title }}</v-list-item-title>
                <v-list-item-subtitle>{{ action.subtitle }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-divider v-if="idx < actions.length - 1"></v-divider>
          </div>
        </v-list>
        <div v-else-if="loadingMyActions != ''">
          Loading ...
        </div>
        <div v-else>
          You have no pending actions
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import { mapActions, mapState } from "vuex";

export default {
  name: "Home",
  data: () => ({
    search: "",
    drawer: null,
    searchResults: [],
    loading: false,
  }),
  mounted() {
    this.loadActions();
  },
  computed: {
    ...mapState("home", ["actions", "loadingMyActions"]),
  },
  methods: {
    ...mapActions("home", ["loadActions"]),
    getIcon(action) {
      if (action.title?.indexOf("Form B") > -1) return "mdi-alpha-b-box";
      return "mdi-alpha-a-box";
    },
  },
};
</script>
