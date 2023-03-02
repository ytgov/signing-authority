<template>
  <div>
    <v-btn color="primary" small @click="doShow">Add Position</v-btn>

    <v-dialog v-model="show" persistent width="600">
      <v-app-bar dark color="#0097A9">
        <v-toolbar-title>
          <span v-if="listLength == 0">Add Deputy Minister or Equivalent</span>
          <span v-else>Add Position</span>
        </v-toolbar-title>
        <v-spacer />
        <v-icon title="Close" @click="show = false">mdi-close</v-icon>
      </v-app-bar>
      <v-card tile>
        <v-card-text class="mt-5 pb-0">
          <v-text-field
            label="Department"
            readonly
            :value="department.display_name"
            dense
            outlined
            append-icon="mdi-lock"
          ></v-text-field>

          <v-combobox
            label="Program"
            dense
            outlined
            :search-input.sync="programSearch"
            v-model="newFormA.program_branch"
            :items="programList"
            clearable
            required
            v-if="listLength > 0"
          >
            <template v-slot:no-data>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>
                    No results matching "<strong>{{ programSearch }}</strong
                    >". Press <kbd>Tab</kbd> to create a new one
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </template>
          </v-combobox>
          <v-combobox
            label="Activity"
            dense
            outlined
            :search-input.sync="activitySearch"
            v-model="newFormA.activity"
            :items="activityList"
            v-if="listLength > 0"
          >
            <template v-slot:no-data>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>
                    No results matching "<strong>{{ activitySearch }}</strong
                    >". Press <kbd>Tab</kbd> to create a new one
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </template>
          </v-combobox>
          <v-text-field label="Position name" dense outlined v-model="newFormA.position" required></v-text-field>

          <div>
            <v-btn @click="doCreate" color="primary" class="float-left" :disabled="newFormA.position.length == 0"
              >Add</v-btn
            >
            <v-btn @click="show = false" color="secondary" class="float-right">Close</v-btn>
          </div>
          <div style="clear: both"></div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapActions } from "vuex";

export default {
  name: "CreateFormAButton",
  props: {
    department: {
      type: Object,
      required: true,
    },
    programList: { type: Array },
    activityList: { type: Array },
    listLength: { type: Number, default: 0 },
    activeDMExists: { type: Boolean },
  },
  mounted() {
    this.newFormA = {
      department_code: "Empty",
      department_descr: "Empty",
      position: "",
      program_branch: "",
      activity: "",
      is_deputy_minister: false,
    };
  },
  data: () => ({
    //see <projectroot>/api/data/models/formA.ts for details
    show: false,
    newFormA: {
      department_code: "Empty",
      department_descr: "Empty",
      position: "",
      program_branch: "",
      activity: "",
      is_deputy_minister: false,
    },
    programSearch: "",
    activitySearch: "",
  }),
  methods: {
    ...mapActions("authority/formA", ["createFormA"]),

    async doShow() {
      if (this.listLength > 0 && !this.activeDMExists) {
        alert("A Deputy Minister or Equivalent must be 'Active' before additional positions can be created");
        return false;
      }

      this.newFormA.department_code = this.department.dept;
      this.newFormA.department_descr = this.department.descr;
      this.newFormA.program_branch = "";
      this.newFormA.position = "";
      this.newFormA.is_deputy_minister = false;

      if (this.listLength == 0) {
        this.newFormA.is_deputy_minister = true;
        this.newFormA.position = "Deputy Minister";
      }
      this.show = true;
    },

    async doCreate() {
      this.newFormA.authority_lines = [{ coding: this.department.dept }];
      let createResponse = await this.createFormA(this.newFormA);
      this.$router.push(`/departments/${this.newFormA.department_code}/positions/${createResponse._id}/edit`);
    },
  },
};
</script>
