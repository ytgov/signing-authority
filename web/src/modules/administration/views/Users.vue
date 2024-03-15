<template>
  <v-container fluid class="down-top-padding">
    <BaseBreadcrumb :title="page.title" :icon="page.icon" :breadcrumbs="breadcrumbs">
      <template v-slot:right>
        <!-- <timed-message ref="messager" class="mr-4"></timed-message> -->
      </template>
    </BaseBreadcrumb>

    <!-- <admin-sidebar></admin-sidebar> -->

    <BaseCard :show-header="true">
      <template v-slot:left>Manage Users</template>
      <template v-slot:right>
        <create-user-btn ref="create-user-btn" :onSave="saveComplete"></create-user-btn>
      </template>

      <v-card class="default">
        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="search"
                prepend-inner-icon="mdi-magnify"
                label="Search"
                clearable
                outlined
                dense
                hide-details
                background-color="white"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                label="Status"
                prepend-inner-icon="mdi-clock"
                v-model="statusFilter"
                :items="['Any', 'Active', 'Inactive']"
                @change="filterList"
                outlined
                dense
                hide-details
                background-color="white"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                label="Role"
                prepend-inner-icon="mdi-filter"
                v-model="roleFilter"
                :items="['Any', ...roleOptions]"
                @change="filterList"
                outlined
                dense
                hide-details
                background-color="white"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                label="Department"
                prepend-inner-icon="mdi-filter"
                v-model="departmentFilter"
                :items="['Any', ...departmentList]"
                item-text="display_name"
                item-value="dept"
                @change="filterList"
                outlined
                dense
                hide-details
                background-color="white"
              />
            </v-col>
          </v-row>

          <v-data-table
            :items="users"
            :search="search"
            :headers="[
              { text: 'Name', value: 'display_name' },
              { text: 'Email', value: 'email' },
              { text: 'Status', value: 'status' },
              { text: 'Roles', value: 'roles' },
              { text: 'Departments', value: 'department_admin_for.length' },
            ]"
            @click:row="rowClick"
            class="mt-5 row-clickable"
            :loading="isLoading"
          ></v-data-table>

          <div class="d-flex mt-2">
            <v-spacer></v-spacer>
            <v-btn small color="info" class="my-0" @click="copyEmails"
              ><v-icon small class="mr-2">mdi-content-copy</v-icon> Copy emails of above users</v-btn
            >
          </div>
        </v-card-text>
      </v-card>
    </BaseCard>

    <user-editor ref="userEditor" :onSave="saveComplete"></user-editor>
    <notifications ref="notifier"></notifications>
  </v-container>
</template>

<script>
import { clone } from "lodash";
import { mapActions, mapGetters, mapState } from "vuex";
import userEditor from "../components/UserEditor.vue";
import CreateUserBtn from "../components/createUserBtn.vue";

export default {
  name: "Home",
  components: { userEditor, CreateUserBtn },
  data: () => ({
    page: { title: "Manage Users" },
    breadcrumbs: [
      { text: "Administration", to: "/administration", exact: true },
      { text: "Manage users", disabled: true },
    ],
    search: "",
    statusFilter: "",
    roleFilter: "",
    departmentFilter: [],

    isLoading: false,
    allUsers: [],
    users: [],
    editUser: null,
  }),
  computed: {
    ...mapState("administration", ["roleOptions"]),
    ...mapGetters("department", ["departmentList"]),
  },
  async mounted() {
    this.statusFilter = "Active";
    this.roleFilter = "Any";
    this.departmentFilter = "Any";
    await this.loadUserList();
  },
  methods: {
    ...mapActions("administration", ["loadUsers"]),
    async loadUserList() {
      this.isLoading = true;
      this.allUsers = await this.loadUsers();
      this.filterList();
      this.isLoading = false;
    },
    saveComplete(resp) {
      this.$refs.notifier.showAPIMessages(resp.data);
      this.loadUserList();
    },
    rowClick(item) {
      this.$refs.userEditor.show(clone(item));
    },

    filterList() {
      let list = clone(this.allUsers);

      if (this.statusFilter && this.statusFilter != "Any") {
        list = list.filter((i) => i.status == this.statusFilter);
      }

      if (this.roleFilter != "Any") {
        list = list.filter((i) => i.roles.includes(this.roleFilter));
      }

      if (this.departmentFilter != "Any") {
        list = list.filter((i) => i.department_admin_for.includes(this.departmentFilter));
      }

      this.users = list;
    },
    copyEmails() {
      let emails = this.users.map((u) => u.email);
      navigator.clipboard.writeText(emails.join("; "));
      this.$refs.notifier.showSuccess("Email list is now in your clipboard - paste into Outlook");
    },
  },
};
</script>
