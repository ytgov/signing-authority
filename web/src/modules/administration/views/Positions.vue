<template>
  <v-container fluid class="down-top-padding">
    <BaseBreadcrumb :title="page.title" :icon="page.icon" :breadcrumbs="breadcrumbs">
      <template v-slot:right>
        <!-- <timed-message ref="messager" class="mr-4"></timed-message> -->
      </template>
    </BaseBreadcrumb>

    <!-- <admin-sidebar></admin-sidebar> -->

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
      <template v-slot:right> </template>

      <v-card class="default">
        <v-card-text>
          <v-data-table
            :items="items"
            :search="search"
            :headers="[
              { text: 'Dept', value: 'department_code' },
              { text: 'Position', value: 'position' },
              { text: 'Status', value: 'status' },
              { text: 'Activation', value: 'activation' },
              { text: 'Deactivation', value: 'deactivation' },
              { text: 'Form A', value: 'position_group_id' },
              { text: 'Lookup', value: 'lookup' },
            ]"
            @click:row="rowClick"
            class="row-clickable"
            :loading="isLoading"
          >
            <template v-slot:item.activation="{ item }">
              <v-icon v-if="item.activation" color="success">mdi-check</v-icon>
            </template>
            <template v-slot:item.deactivation="{ item }">
              <v-icon v-if="item.deactivation" color="error">mdi-check</v-icon>
            </template>

            <template v-slot:item.position_group_id="{ item }">
              <router-link
                v-if="item.position_group_id && item.position_group_id != -1"
                :to="`/departments/${item.department_code}/form-a/${item.position_group_id}`"
                target="_blank"
                @click.native.capture.stop
                ><v-icon color="primary">mdi-link-variant</v-icon>
              </router-link>
            </template>

            <template v-slot:item.lookup="{ item }">
              <div
                v-if="!item.position_group_id && item.activation && item.activation.file_id"
                @click.native.capture.stop
              >
                {{ signtureForFile(item.activation.file_id) }}
              </div>
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>
    </BaseCard>

    <v-dialog persistent v-model="showEdit" width="600">
      <v-app-bar dark color="#0097A9">
        <v-toolbar-title>Override Form A Status</v-toolbar-title>
        <v-spacer />
        <v-icon title="Close" @click="showEdit = false">mdi-close</v-icon>
      </v-app-bar>
      <v-card tile>
        <v-card-text class="mt-5 pb-0" v-if="editItem">
          <p>
            This will override the status of the selected Form A, but will have no impact on any linked Position
            records.
          </p>

          <v-select v-model="editItem.status" :items="['Pending', 'Archived', 'Active']" outlined dense></v-select>

          <v-btn color="primary" @click="saveClick">Save</v-btn>
        </v-card-text>
      </v-card>
    </v-dialog>

    <notifications ref="notifier"></notifications>
  </v-container>
</template>

<script>
import { clone } from "lodash";
import { mapActions } from "vuex";

export default {
  name: "Home",
  components: {},
  data: () => ({
    page: { title: "All Positions" },
    breadcrumbs: [
      { text: "Administration", to: "/administration", exact: true },
      { text: "All Positions", disabled: true },
    ],
    search: "",
    isLoading: false,
    items: [],
    formAs: [],
    editItem: null,
    showEdit: false,
  }),
  async mounted() {
    this.loadItems();
  },
  computed: {
    signatures() {
      if (this.formAs) {
        let sigs = this.formAs.filter((a) => a.upload_signatures);
        let sigList = [];

        for (let sig of sigs) {
          sigList.push({ ...sig.upload_signatures, _id: sig._id });
        }

        return sigList;
      }

      return [];
    },
  },
  methods: {
    ...mapActions("administration", ["getPositionList", "setFormAStatus", "getFormAList"]),
    async loadItems() {
      this.isLoading = true;
      this.items = await this.getPositionList();
      this.formAs = await this.getFormAList();
      this.isLoading = false;
    },
    rowClick(item) {
      this.editItem = clone(item);
      this.showEdit = true;
    },
    async saveClick() {
      let resp = await this.setFormAStatus({ id: this.editItem._id, status: this.editItem.status });

      if (resp == "success") {
        this.items = await this.getPositionList();
        this.showEdit = false;
      }
    },
    signtureForFile(id) {
      let sig = this.signatures.filter((s) => s.file_id == id);

      if (sig.length > 0) return sig[0]._id;
      return null;
    },
  },
};
</script>
