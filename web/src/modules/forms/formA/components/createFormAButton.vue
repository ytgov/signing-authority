<template>
    <v-dialog v-model="show" persistent width="600">
        <template v-slot:activator="{ on, attrs }">
            <v-btn
                color="primary"
                small
                v-bind="attrs"
                v-on="on"
                @click="doShow"
                >Add Position</v-btn
            >
        </template>

        <v-app-bar dark color="#0097A9">
            <v-toolbar-title>Add Form A Position</v-toolbar-title>
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
                >
                    <template v-slot:no-data>
                        <v-list-item>
                            <v-list-item-content>
                                <v-list-item-title>
                                    No results matching "<strong>{{
                                        programSearch
                                    }}</strong
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
                >
                    <template v-slot:no-data>
                        <v-list-item>
                            <v-list-item-content>
                                <v-list-item-title>
                                    No results matching "<strong>{{
                                        activitySearch
                                    }}</strong
                                    >". Press <kbd>Tab</kbd> to create a new
                                    one
                                </v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                    </template>
                </v-combobox>
                <v-text-field
                    label="Position"
                    dense
                    outlined
                    v-model="newFormA.position"
                    required
                ></v-text-field>

                <div>
                    <v-btn
                        @click="doCreate"
                        color="primary"
                        class="float-left"
                        :disabled="newFormA.position.length == 0"
                        >Add</v-btn
                    >
                    <v-btn
                        @click="show = false"
                        color="secondary"
                        class="float-right"
                        >Close</v-btn
                    >
                </div>
                <div style="clear: both"></div>
            </v-card-text>
        </v-card>
    </v-dialog>
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
    },
    mounted() {
        this.newFormA = {
            department_code: "Empty",
            department_descr: "Empty",
            position: "",
            program_branch: "",
            activity: "",
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
        },
        programSearch: "",
        activitySearch: "",
    }),
    methods: {
        ...mapActions("authority/formA", ["createFormA"]),

        async doShow() {
            this.newFormA.department_code = this.department.dept;
            this.newFormA.department_descr = this.department.descr;
            this.newFormA.program_branch = "";
            this.newFormA.position = "";
        },

        async doCreate() {
            this.newFormA.authority_lines = [{ coding: this.department.dept }];
            let createResponse = await this.createFormA(this.newFormA);
            this.$router.push(
                `/departments/${this.newFormA.department_code}/positions/${createResponse._id}/edit`
            );
        },
    },
};
</script>

