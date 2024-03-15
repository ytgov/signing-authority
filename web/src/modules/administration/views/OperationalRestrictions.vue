<template>
  <v-container fluid class="down-top-padding">
    <BaseBreadcrumb :title="page.title" :icon="page.icon" :breadcrumbs="breadcrumbs">
      <template v-slot:right> </template>
    </BaseBreadcrumb>

    <BaseCard :show-header="true">
      <template v-slot:left>
        <v-text-field
          v-model="search"
          hide-details
          background-color="white"
          label="Search"
          prepend-icon="mdi-magnify"
          :loading="isLoading"
          clearable
        ></v-text-field>
      </template>
      <template v-slot:right>
        <v-btn color="primary" small @click="addClick">Add</v-btn>
      </template>

      <v-card class="default">
        <v-card-text>
          <v-data-table
            :items="operationalRestrictions"
            :search="search"
            :headers="[
              { text: 'Description', value: 'description' },
              { text: 'Sort order', value: 'sort' },
              { text: 'Active', value: 'is_active' },
            ]"
            @click:row="rowClick"
            class="row-clickable"
            :loading="isLoading"
            :options="options"
          >
            <template v-slot:item.is_active="{ item }"> {{ item.is_active ? "Yes" : "No" }}</template>
          </v-data-table>
        </v-card-text>
      </v-card>
    </BaseCard>

    <OperationalRestrictionEditor ref="editor" :onSave="saveComplete"></OperationalRestrictionEditor>
    <notifications ref="notifier"></notifications>
  </v-container>
</template>

<script>
import _ from "lodash";
import { mapActions, mapState } from "vuex";
import OperationalRestrictionEditor from "../components/OperationalRestrictionEditor.vue";

export default {
  name: "Home",
  components: { OperationalRestrictionEditor },
  data: () => ({
    page: { title: "Operational Restrictions" },
    breadcrumbs: [
      { text: "Administration", to: "/administration", exact: true },
      { text: "Operational Restrictions", disabled: true },
    ],
    search: "",
    isLoading: false,
    editUser: null,
    options: {
      sortBy: ["sort"]
    },
  }),
  computed: {
    ...mapState("administration", ["operationalRestrictions"]),
  },
  async mounted() {
    this.loadList();
  },
  methods: {
    ...mapActions("administration", ["getOperationalRestrictions"]),
    async loadList() {
      this.isLoading = true;
      await this.getOperationalRestrictions();
      this.isLoading = false;
    },
    saveComplete(resp) {
      this.$refs.notifier.showAPIMessages(resp.data);
      this.loadList();
    },
    addClick() {
      this.$refs.editor.show({ description: "", is_active: true, sort: 99 });
    },
    rowClick(item) {
      this.$refs.editor.show(_.clone(item));
    },
  },
};
</script>
